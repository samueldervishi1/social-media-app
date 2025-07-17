package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for managing user posts, including creation, retrieval,
 * and soft deletion.
 */
@Service
@RequiredArgsConstructor
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final AchievementService achievementService;

    @Transactional
    public void createPost(String username, Post post) {
        User user = getUserByUsername(username);
        enrichPostWithMetadata(post, user);
        user.setPostCount(user.getPostCount() + 1);
        user.setKarma(user.getKarma() + 10);
        userRepository.save(user);

        achievementService.evaluateAchievements(user);
        postRepository.save(post);
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
                .orElseThrow(() -> new CustomException(String.format(Messages.POST_NOT_FOUND, postId)));
    }

    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserId(userId);
    }

    public long getPostCountPerUser(String userId) {
        return postRepository.countByUserIdAndDeletedFalse(userId);
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
    }

    public List<Post> getTopPosts(int limit) {
        List<Post> allPosts = postRepository.findAll();
        return allPosts.stream().filter(p -> p.getLikedUserIds() != null)
                .sorted((p1, p2) -> Integer.compare(p2.getLikedUserIds().size(), p1.getLikedUserIds().size()))
                .limit(limit).toList();
    }

    public void savePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));

        if (user.getSavedPostIds() == null) {
            user.setSavedPostIds(new ArrayList<>());
        }

        if (!user.getSavedPostIds().contains(postId)) {
            user.getSavedPostIds().add(postId);
            post.getSavedUserIds().add(userId);
            userRepository.save(user);
            postRepository.save(post);
        } else {
            throw new CustomException(409, String.format(Messages.POST_ALREADY_SAVED, postId, userId));
        }
    }

    public void unsavePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));

        if (user.getSavedPostIds() != null && user.getSavedPostIds().contains(postId)) {
            user.getSavedPostIds().remove(postId);
            userRepository.save(user);
        }
    }

    public List<Post> getSavedPosts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));

        return postRepository.findAllById(user.getSavedPostIds());
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(String.format(Messages.USER_NOT_FOUND, username)));
    }

    public int getCommentCountForPost(String postId) {
        Post post = getPostById(postId);
        return post.getCommentList() != null ? post.getCommentList().size() : 0;
    }
}
