package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Service responsible for managing user posts, including creation,
 * retrieval, and soft deletion.
 */
@Service
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final AchievementService achievementService;
    private static final Logger LOGGER = LoggerFactory.getLogger(PostService.class);

    public PostService(UserRepository userRepository, PostRepository postRepository, AchievementService achievementService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.achievementService = achievementService;
    }

    @Transactional
    public void createPost(String username, Post post) {
        User user = getUserByUsername(username);
        enrichPostWithMetadata(post, user);
        user.setPostCount(user.getPostCount() + 1);
        userRepository.save(user);

        achievementService.evaluateAchievements(user);
        postRepository.save(post);
        LOGGER.info("Post created by user '{}' with postId '{}'", username, post.getId());
    }

    private void enrichPostWithMetadata(Post post, User user) {
        post.setUserId(user.getId());
        post.setPostDate(LocalDate.now().toString());
        post.setPostTime(LocalTime.now().toString());
    }

    public Page<Post> getAllPostsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postDate").descending());
        return postRepository.findAll(pageable);
    }

    public Post getPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> {
                    LOGGER.warn("Post not found with ID: {}", postId);
                    return new CustomException(String.format(Messages.POST_NOT_FOUND, postId));
                });
    }

    public List<Post> getUserPosts(String userId) {
        List<Post> posts = postRepository.findByUserId(userId);
        LOGGER.info("Fetched {} posts for userId '{}'", posts.size(), userId);
        return posts;
    }

    public long getPostCountPerUser(String userId) {
        long count = postRepository.countByUserIdAndDeletedFalse(userId);
        LOGGER.info("Post count for userId '{}': {}", userId, count);
        return count;
    }

    public boolean isPostLikedByUser(String postId, String userId) {
        Post post = getPostById(postId);
        return post.getLikedUserIds() != null && post.getLikedUserIds().contains(userId);
    }

    @Transactional
    public void deletePost(String postId) {
        Post post = getPostById(postId);
        post.setDeleted(true);
        postRepository.save(post);
        LOGGER.info("Soft-deleted post with ID '{}'", postId);
    }

    public List<Post> getTopPosts(int limit) {
        List<Post> allPosts = postRepository.findAll();
        return allPosts.stream()
                .filter(p -> p.getLikedUserIds() != null)
                .sorted((p1, p2) -> Integer.compare(
                        p2.getLikedUserIds().size(),
                        p1.getLikedUserIds().size()))
                .limit(limit)
                .toList();
    }

    public void savePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, "Post not found"));

        if (user.getSavedPostIds() == null) {
            user.setSavedPostIds(new ArrayList<>());
        }

        if (!user.getSavedPostIds().contains(postId)) {
            user.getSavedPostIds().add(postId);
            post.getSavedUserIds().add(userId);
            userRepository.save(user);
            postRepository.save(post);
        } else {
            throw new CustomException(409, "Post already saved by user");
        }
    }

    public void unsavePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        if (user.getSavedPostIds() != null && user.getSavedPostIds().contains(postId)) {
            user.getSavedPostIds().remove(postId);
            userRepository.save(user);
        }
    }

    public List<Post> getSavedPosts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        return postRepository.findAllById(user.getSavedPostIds());
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    LOGGER.warn("User not found with username: {}", username);
                    return new CustomException(String.format(Messages.USER_NOT_FOUND, username));
                });
    }

    public int getCommentCountForPost(String postId) {
        Post post = getPostById(postId);
        return post.getCommentList() != null ? post.getCommentList().size() : 0;
    }
}