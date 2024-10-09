package org.server.socialapp.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.server.socialapp.models.Video;
import org.server.socialapp.repositories.VideoRepository;
import org.server.socialapp.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/videos")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private VideoRepository videoRepository;

    @GetMapping("/recommendations/{userId}")
    public List<Video> getUserRecommendations(@PathVariable String userId) {
        try {
            return recommendationService.getRecommendations(userId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Video>> getAllVideos() {
        List<Video> videos = recommendationService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/user/{userId}/videos")
    public ResponseEntity<Map<String, List<Video>>> getUserVideos(@PathVariable String userId) {
        try {
            Map<String, List<Video>> userVideos = recommendationService.getUserVideos(userId);
            return ResponseEntity.ok(userVideos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{videoId}/like/{userId}")
    public String likeVideo(@PathVariable String videoId, @PathVariable String userId) {
        try {
            Optional<Video> videoOptional = videoRepository.findById(videoId);
            if (videoOptional.isEmpty()) {
                return "Video not found.";
            }
            Video video = videoOptional.get();
            return recommendationService.likeVideo(userId, video);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to like video: " + e.getMessage();
        }
    }

    @PostMapping("/{videoId}/save/{userId}")
    public String saveVideo(@PathVariable String videoId, @PathVariable String userId) {
        try {
            Optional<Video> videoOptional = videoRepository.findById(videoId);
            if (videoOptional.isEmpty()) {
                return "Video not found.";
            }
            Video video = videoOptional.get();
            return recommendationService.saveVideo(userId, video);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to save video: " + e.getMessage();
        }
    }

    @PostMapping("/")
    public Video createVideo(@RequestBody Video video) {
        try {
            System.out.println("Received Video: " + video);
            return recommendationService.saveVideoToDB(video);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating video", e);
        }
    }
}
