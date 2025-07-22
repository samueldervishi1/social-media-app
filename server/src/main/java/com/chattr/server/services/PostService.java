package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LoggingService loggingService;

    @Transactional
    public void createPost(String username, Post post) {
        String sessionId = loggingService.getCurrentSessionId();

        try {
            User user = getUserByUsername(username);

            loggingService.logSecurityEvent("POST_CREATE_ATTEMPT", user.getId(), sessionId,
                    String.format("User %s attempting to create post with content length: %d chars", username,
                            post.getContent() != null ? post.getContent().length() : 0));

            enrichPostWithMetadata(post, user);

            user.setPostCount(user.getPostCount() + 1);
            user.setKarma(user.getKarma() + 10);

            postRepository.save(post);
            userRepository.save(user);

            loggingService.logSecurityEvent("POST_CREATE_SUCCESS", user.getId(), sessionId, String
                    .format("User %s successfully created post. New post count: %d", username, user.getPostCount()));

        } catch (CustomException e) {
            loggingService.logSecurityEvent("POST_CREATE_FAILED", username, sessionId,
                    String.format("Post creation failed for user %s: %s", username, e.getMessage()));
            loggingService.logError("PostService", "createPost", "Post creation error", e);
            throw e;
        } catch (Exception e) {
            loggingService.logSecurityEvent("POST_CREATE_ERROR", username, sessionId,
                    String.format("System error during post creation for user %s", username));
            loggingService.logError("PostService", "createPost", "Unexpected error during post creation", e);
            throw new CustomException(500, "Failed to create post");
        }
    }

    private void enrichPostWithMetadata(Post post, User user) {
        post.setUserId(user.getId());
        LocalDateTime now = LocalDateTime.now();
        post.setPostDate(now.toLocalDate().toString());
        post.setPostTime(now.toLocalTime().toString());
        post.setDeleted(false);
    }

    public Page<Post> getAllPostsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postDate").descending());
        return postRepository.findAllActivePostsPaged(pageable);
    }

    public Post getPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(String.format(Messages.POST_NOT_FOUND, postId)));
    }

    public List<Post> getUserPosts(String userId) {
        return postRepository.findActivePostsByUserId(userId);
    }

    public long getPostCountPerUser(String userId) {
        return postRepository.countByUserIdAndDeletedFalse(userId);
    }

    public boolean isPostLikedByUser(String postId, String userId) {
        return postRepository.existsByIdAndLikedUserId(postId, userId);
    }

    @Transactional
    public void deletePost(String postId) {
        Post post = getPostById(postId);
        post.setDeleted(true);
        postRepository.save(post);
    }

    public List<Post> getTopPosts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return postRepository.findTopPostsByLikes(pageable);
    }

    @Transactional
    public void savePost(String userId, String postId) {
        User user = getUserById(userId);
        Post post = getPostById(postId);

        if (user.getSavedPostIds() == null) {
            user.setSavedPostIds(new ArrayList<>());
        }

        if (user.getSavedPostIds().contains(postId)) {
            throw new CustomException(409, String.format(Messages.POST_ALREADY_SAVED, postId, userId));
        }

        user.getSavedPostIds().add(postId);
        if (post.getSavedUserIds() == null) {
            post.setSavedUserIds(new ArrayList<>());
        }
        post.getSavedUserIds().add(userId);

        userRepository.save(user);
        postRepository.save(post);
    }

    @Transactional
    public void unsavePost(String userId, String postId) {
        User user = getUserById(userId);
        Post post = getPostById(postId);

        if (user.getSavedPostIds() != null) {
            user.getSavedPostIds().remove(postId);
            userRepository.save(user);
        }

        if (post.getSavedUserIds() != null) {
            post.getSavedUserIds().remove(userId);
            postRepository.save(post);
        }
    }

    public List<Post> getSavedPosts(String userId) {
        User user = getUserById(userId);
        if (user.getSavedPostIds() == null || user.getSavedPostIds().isEmpty()) {
            return List.of();
        }
        return postRepository.findActivePostsByIds(user.getSavedPostIds());
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(String.format(Messages.USER_NOT_FOUND, username)));
    }

    private User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));
    }

    public int getCommentCountForPost(String postId) {
        Post post = getPostById(postId);
        return post.getCommentList() != null ? post.getCommentList().size() : 0;
    }
}
