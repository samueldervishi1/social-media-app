package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.models.Comments;
import org.server.socialapp.models.Post;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.ActivityRepository;
import org.server.socialapp.repositories.CommentsRepository;
import org.server.socialapp.repositories.PostRepository;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CommentsService {

    private static final Logger logger = LoggerFactory.getLogger(CommentsService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private CommentsRepository commentsRepository;

    @Transactional
    public Comments createComment(String userId, String postId, Comments comment) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                logger.warn("User not found with userId: {}", userId);
                throw new NotFoundException("User not found with userId: " + userId);
            }

            User user = userOptional.get();

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> {
                        logger.warn("Post not found with ID: {}", postId);
                        return new NotFoundException("Post not found with ID: " + postId);
                    });

            comment.setUserId(user.getId());
            post.getCommentsList().add(comment);

            postRepository.save(post);

            String activityDescription = "created comment with id " + comment.getId() + " on post with id " + postId;
            List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

            if (!existingActivities.isEmpty()) {
                for (ActivityModel activity : existingActivities) {
                    activity.getActionType().getAllActivity().add(activityDescription);
                    activityRepository.save(activity);
                }
            } else {
                ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                ActivityModel activity = new ActivityModel(actionType, user.getId(), Instant.now(), "active");
                activityRepository.save(activity);
            }

            logger.info("Comment created with ID: {}", comment.getId());
            return comment;
        } catch (NotFoundException e) {
            logger.error("Error creating comment: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while creating comment. Error: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while creating the comment");
        }
    }

    public Comments getCommentById(String postId, String commentId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> {
                        logger.warn("Post not found with ID: {}", postId);
                        return new NotFoundException("Post not found with ID: " + postId);
                    });

            Optional<Comments> commentOptional = post.getCommentsList().stream()
                    .filter(comment -> comment.getId().equals(commentId))
                    .findFirst();

            if (commentOptional.isEmpty()) {
                logger.warn("Comment not found with ID: {} in post with ID: {}", commentId, postId);
                throw new NotFoundException("Comment not found with ID: " + commentId);
            }

            return commentOptional.get();
        } catch (NotFoundException e) {
            logger.error("Error retrieving comment: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while retrieving comment. Error: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while retrieving the comment");
        }
    }
}
