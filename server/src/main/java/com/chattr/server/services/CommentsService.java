package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Comment;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service responsible for managing comments on posts, including creation, deletion, and retrieval.
 */
@Service
public class CommentsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private static final Logger LOGGER = LoggerFactory.getLogger(CommentsService.class);

    public CommentsService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public Comment createComment(String userId, String postId, Comment comment) {
        return wrapSafe(() -> {
            User user = getUserById(userId);
            Post post = getPostById(postId);

            comment.setUserId(user.getId());
            post.getCommentList().add(comment);
            postRepository.save(post);

            LOGGER.info("Comment added by user '{}' on post '{}'", userId, postId);
            return comment;
        });
    }

    @Transactional
    public void deleteComment(String postId, String commentId) {
        wrapSafe(() -> {
            Post post = getPostById(postId);
            Comment comment = getCommentFromPost(post, commentId);

            post.getCommentList().remove(comment);
            postRepository.save(post);

            LOGGER.info("Comment with ID '{}' removed from post '{}'", commentId, postId);
            return null;
        });
    }

    public Optional<Comment> getCommentById(String postId, String commentId) {
        return wrapSafe(() -> {
            Post post = getPostById(postId);
            Comment comment = getCommentFromPost(post, commentId);

            LOGGER.info("Comment fetched for post '{}', comment '{}'", postId, commentId);
            return Optional.of(comment);
        });
    }

    private User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    LOGGER.warn("User not found: {}", userId);
                    return new CustomException(404, String.format(Messages.USER_NOT_FOUND_BY_ID, userId));
                });
    }

    private Post getPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> {
                    LOGGER.warn("Post not found: {}", postId);
                    return new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId));
                });
    }

    private Comment getCommentFromPost(Post post, String commentId) {
        return post.getCommentList().stream()
                .filter(comment -> comment.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> {
                    LOGGER.warn("Comment not found in post '{}': {}", post.getId(), commentId);
                    return new CustomException(404, String.format(Messages.COMMENT_NOT_FOUND, commentId));
                });
    }

    private <T> T wrapSafe(SafeAction<T> action) {
        try {
            return action.run();
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            LOGGER.error("Unhandled exception: {}", e.getMessage(), e);
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    @FunctionalInterface
    private interface SafeAction<T> {
        T run();
    }
}