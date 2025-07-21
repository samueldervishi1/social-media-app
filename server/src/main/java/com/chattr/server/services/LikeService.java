package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Like;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.LikeRepository;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public LikeService(LikeRepository likeRepository, UserRepository userRepository, PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public void likePost(String userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userId)));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));

        Like userLikes = likeRepository.findById(userId).orElse(null);

        if (userLikes == null) {
            userLikes = new Like(userId, postId);
        } else {
            if (userLikes.getPostIds().contains(postId)) {
                throw new CustomException(400, String.format(Messages.ALREADY_LIKED));
            }
            userLikes.getPostIds().add(postId);
            userLikes.setTimestamp(LocalDateTime.now());
        }

        likeRepository.save(userLikes);
        user.setLikeCount(user.getLikeCount() + 1);
        if (post.getLikedUserIds() == null)
            post.setLikedUserIds(new ArrayList<>());
        post.getLikedUserIds().add(userId);
        postRepository.save(post);
    }

    public void unlikePost(String userId, String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));

        Like userLikes = likeRepository.findById(userId)
                .orElseThrow(() -> new CustomException(400, String.format(Messages.USER_HAS_NOT_LIKED)));

        if (!userLikes.getPostIds().contains(postId)) {
            throw new CustomException(400, String.format(Messages.USER_HAS_NOT_LIKED));
        }

        userLikes.getPostIds().remove(postId);
        userLikes.setTimestamp(LocalDateTime.now());
        likeRepository.save(userLikes);

        if (post.getLikedUserIds() != null) {
            post.getLikedUserIds().remove(userId);
            postRepository.save(post);
        }
    }

    public long getLikeCount(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));
        return post.getLikedUserIds() == null ? 0 : post.getLikedUserIds().size();
    }

    public Optional<Like> getUserLikes(String userId) {
        return likeRepository.findById(userId);
    }
}
