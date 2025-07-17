package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Comment;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for managing comments on posts, including creation,
 * deletion, and retrieval.
 */
@Service
public class CommentsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LoggingService loggingService;
    private final AchievementService achievementService;

    public CommentsService(UserRepository userRepository, PostRepository postRepository, LoggingService loggingService,
            AchievementService achievementService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.loggingService = loggingService;
        this.achievementService = achievementService;
    }

    @Transactional
    public Comment createComment(String userId, String postId, Comment comment) {
        return wrapSafe(() -> {
            User user = getUserById(userId);
            Post post = getPostById(postId);

            comment.setUserId(user.getId());
            post.getCommentList().add(comment);

            user.setCommentCount(user.getCommentCount() + 1);

            postRepository.save(post);
            userRepository.save(user);

            achievementService.evaluateAchievements(user);

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

            return null;
        });
    }

    public Optional<Comment> getCommentById(String postId, String commentId) {
        return wrapSafe(() -> {
            Post post = getPostById(postId);
            Comment comment = getCommentFromPost(post, commentId);

            return Optional.of(comment);
        });
    }

    private User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND_BY_ID, userId)));
    }

    private Post getPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));
    }

    private Comment getCommentFromPost(Post post, String commentId) {
        return post.getCommentList().stream().filter(comment -> comment.getId().equals(commentId)).findFirst()
                .orElseThrow(() -> new CustomException(404, String.format(Messages.COMMENT_NOT_FOUND, commentId)));
    }

    private <T> T wrapSafe(SafeAction<T> action) {
        try {
            return action.run();
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            loggingService.logError("CommentService", "wrapSafe", "Unexpected error during safe action", e);
            throw new CustomException(500, Messages.ERROR_500);
        }
    }

    @FunctionalInterface
    private interface SafeAction<T> {
        T run();
    }
}
