package org.server.socialapp.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.server.socialapp.models.UserVideoActions;
import org.server.socialapp.models.Video;
import org.server.socialapp.repositories.UserVideoActionsRepository;
import org.server.socialapp.repositories.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.server.socialapp.repositories.UserRepository;

@Service
public class RecommendationService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserVideoActionsRepository userVideoActionsRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Video> getRecommendations(String userId) {
        Optional<UserVideoActions> userActionsOptional = userVideoActionsRepository.findByUserId(userId);
        if (userActionsOptional.isEmpty()) {
            throw new IllegalArgumentException("User does not exist.");
        }

        UserVideoActions userVideoActions = userActionsOptional.get();
        List<Video> savedVideos = userVideoActions.getSavedVideos();
        Set<String> allTags = savedVideos.stream()
                .flatMap(video -> video.getTags().stream())
                .collect(Collectors.toSet());

        List<Video> allVideos = videoRepository.findAll();
        List<Video> recommendedVideos = findSimilarVideos(allTags, allVideos);

        recommendedVideos.removeAll(savedVideos);

        return recommendedVideos;
    }

    private List<Video> findSimilarVideos(Set<String> tags, List<Video> allVideos) {
        return allVideos.stream()
                .filter(video -> !Collections.disjoint(tags, new HashSet<>(video.getTags())))
                .sorted((video1, video2) -> Integer.compare(
                        (int) getMatchingTagsCount(new HashSet<>(video2.getTags()), tags),
                        (int) getMatchingTagsCount(new HashSet<>(video1.getTags()), tags)))
                .limit(5)
                .collect(Collectors.toList());
    }

    private long getMatchingTagsCount(Set<String> videoTags, Set<String> userTags) {
        return videoTags.stream()
                .filter(userTags::contains)
                .count();
    }

    public String likeVideo(String userId, Video video) throws Exception {
        Optional<?> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User does not exist.");
        }
        updateUserVideoActions(userId, video, "like");
        return "Video liked successfully";
    }

    public String saveVideo(String userId, Video video) throws Exception {
        Optional<?> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User does not exist.");
        }
        updateUserVideoActions(userId, video, "save");
        return "Video saved successfully";
    }

    private void updateUserVideoActions(String userId, Video video, String action) throws Exception {
        Optional<UserVideoActions> userVideoActionsOptional = userVideoActionsRepository.findByUserId(userId);
        UserVideoActions userVideoActions;

        if (userVideoActionsOptional.isPresent()) {
            userVideoActions = userVideoActionsOptional.get();
        } else {
            userVideoActions = new UserVideoActions();
            userVideoActions.setUserId(userId);
        }

        if ("like".equals(action)) {
            if (userVideoActions.getLikedVideos() == null) {
                userVideoActions.setLikedVideos(new ArrayList<>());
            }
            List<Video> likedVideos = userVideoActions.getLikedVideos();
            if (!likedVideos.contains(video)) {
                likedVideos.add(video);
            }
            userVideoActions.setLikedVideos(likedVideos);
        } else if ("save".equals(action)) {
            if (userVideoActions.getSavedVideos() == null) {
                userVideoActions.setSavedVideos(new ArrayList<>());
            }
            List<Video> savedVideos = userVideoActions.getSavedVideos();
            if (!savedVideos.contains(video)) {
                savedVideos.add(video);
            }
            userVideoActions.setSavedVideos(savedVideos);
        } else {
            throw new IllegalArgumentException("Invalid action: " + action);
        }

        userVideoActionsRepository.save(userVideoActions);
    }

    public Video saveVideoToDB(Video video) {
        try {
            return videoRepository.save(video);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error saving video to database", e);
        }
    }

    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    public Map<String, List<Video>> getUserVideos(String userId) {
        Optional<UserVideoActions> userActionsOptional = userVideoActionsRepository.findByUserId(userId);

        List<Video> savedVideos = new ArrayList<>();
        List<Video> likedVideos = new ArrayList<>();

        if (userActionsOptional.isPresent()) {
            UserVideoActions userVideoActions = userActionsOptional.get();
            savedVideos = userVideoActions.getSavedVideos() != null ? userVideoActions.getSavedVideos() : new ArrayList<>();
            likedVideos = userVideoActions.getLikedVideos() != null ? userVideoActions.getLikedVideos() : new ArrayList<>();
        }

        Map<String, List<Video>> response = new HashMap<>();
        response.put("savedVideos", savedVideos);
        response.put("likedVideos", likedVideos);

        return response;
    }

}
