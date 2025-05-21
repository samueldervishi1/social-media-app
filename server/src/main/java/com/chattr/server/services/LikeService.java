package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Like;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.LikeRepository;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ActivityLogService activityLogService;
    private final AchievementService achievementService;


    public LikeService(LikeRepository likeRepository, UserRepository userRepository, PostRepository postRepository, ActivityLogService activityLogService, AchievementService achievementService) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.activityLogService = activityLogService;
        this.achievementService = achievementService;
    }

    public void likePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, "Post not found"));

        Like userLikes = likeRepository.findById(userId).orElse(null);

        if (userLikes == null) {
            userLikes = new Like(userId, postId);
        } else {
            if (userLikes.getPostIds().contains(postId)) {
                throw new CustomException(400, "User already liked this post");
            }
            userLikes.getPostIds().add(postId);
            userLikes.setTimestamp(LocalDateTime.now());
        }

        likeRepository.save(userLikes);
        user.setLikeCount(user.getLikeCount() + 1);
        achievementService.evaluateAchievements(user);
        activityLogService.log(userId, "LIKE_POST", userId + "liked this post.");

        if (post.getLikedUserIds() == null) post.setLikedUserIds(new ArrayList<>());
        post.getLikedUserIds().add(userId);
        activityLogService.log(postId, "LIKE_POST", "This post has been liked by user." + userId + ".");
        postRepository.save(post);
    }

    public void unlikePost(String userId, String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, "Post not found"));

        Like userLikes = likeRepository.findById(userId)
                .orElseThrow(() -> new CustomException(400, "User has not liked anything"));

        if (!userLikes.getPostIds().contains(postId)) {
            throw new CustomException(400, "User has not liked this post");
        }

        userLikes.getPostIds().remove(postId);
        userLikes.setTimestamp(LocalDateTime.now());
        activityLogService.log(userId, "UNLIKE_POST", userId + "unliked this post.");
        likeRepository.save(userLikes);

        if (post.getLikedUserIds() != null) {
            post.getLikedUserIds().remove(userId);
            postRepository.save(post);
        }
    }

    public long getLikeCount(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, "Post not found"));
        return post.getLikedUserIds() == null ? 0 : post.getLikedUserIds().size();
    }

    public Optional<Like> getUserLikes(String userId) {
        return likeRepository.findById(userId);
    }
}