package org.server.socialapp.services;

import org.server.socialapp.exceptions.BadRequestException;
import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.ResourceNotFoundException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.models.Like;
import org.server.socialapp.models.Post;
import org.server.socialapp.repositories.ActivityRepository;
import org.server.socialapp.repositories.LikesRepository;
import org.server.socialapp.repositories.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LikesService {

    private static final Logger logger = LoggerFactory.getLogger(LikesService.class);

    @Autowired
    private LikesRepository likesRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Transactional
    public Like likePost(String userId, String postId) {
        try {
            List<Like> userLikes = likesRepository.findByUserId(userId);
            Like like;

            if (userLikes.isEmpty()) {
                like = new Like(userId);
            } else {
                like = userLikes.get(0);
            }

            // Ensure postId is in list or throw exception if not valid
            if (like.getPostId() == null) {
                like.setPostId(new ArrayList<>());
            }
            if (!like.getPostId().contains(postId)) {
                like.getPostId().add(postId);
            } else {
                throw new BadRequestException("Post is already liked");
            }

            likesRepository.save(like);

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

            if (!post.getLikes().contains(userId)) {
                post.getLikes().add(userId);
            }

            postRepository.save(post);

            String activityDescription = userId + " " + "liked post with id " + postId;
            List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

            if (!existingActivities.isEmpty()) {
                for (ActivityModel activity : existingActivities) {
                    activity.getActionType().getAllActivity().add(activityDescription);
                    activityRepository.save(activity);
                }
            } else {
                ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                ActivityModel activity = new ActivityModel(actionType, userId, Instant.now(), "active");
                activityRepository.save(activity);
            }

            return like;
        } catch (BadRequestException | ResourceNotFoundException e) {
            logger.error("Error liking post: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while liking post: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while liking the post");
        }
    }

    @Transactional
    public Like likeComment(String userId, String commentId) {
        try {
            List<Like> userLikes = likesRepository.findByUserId(userId);
            Like like;

            if (userLikes.isEmpty()) {
                like = new Like(userId);
            } else {
                like = userLikes.get(0);
            }

            if (like.getCommentId() == null) {
                like.setCommentId(new ArrayList<>());
            }

            if (!like.getCommentId().contains(commentId)) {
                like.getCommentId().add(commentId);
            } else {
                throw new BadRequestException("Comment is already liked");
            }
            String activityDescription = userId + " " + "liked comment with id " + commentId;
            List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

            if (!existingActivities.isEmpty()) {
                for (ActivityModel activity : existingActivities) {
                    activity.getActionType().getAllActivity().add(activityDescription);
                    activityRepository.save(activity);
                }
            } else {
                ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                ActivityModel activity = new ActivityModel(actionType, userId, Instant.now(), "active");
                activityRepository.save(activity);
            }

            return likesRepository.save(like);
        } catch (BadRequestException e) {
            logger.error("Error liking comment: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while liking comment: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while liking the comment");
        }
    }

    @Transactional
    public void unlikePost(String userId, String postId) {
        try {
            List<Like> userLikes = likesRepository.findByUserId(userId);
            if (userLikes.isEmpty()) {
                throw new ResourceNotFoundException("User has not liked any posts");
            }

            Like like = userLikes.get(0);
            if (like.getPostId() != null && like.getPostId().contains(postId)) {
                like.getPostId().remove(postId);
                likesRepository.save(like);
            } else {
                throw new BadRequestException("Post was not liked");
            }
        } catch (ResourceNotFoundException | BadRequestException e) {
            logger.error("Error unliking post: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while unliking post: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while unliking the post");
        }
    }

    @Transactional
    public void unlikeComment(String userId, String commentId) {
        try {
            List<Like> userLikes = likesRepository.findByUserId(userId);
            if (userLikes.isEmpty()) {
                throw new ResourceNotFoundException("User has not liked any comments");
            }

            Like like = userLikes.get(0);
            if (like.getCommentId() != null && like.getCommentId().contains(commentId)) {
                like.getCommentId().remove(commentId);
                likesRepository.save(like);
            } else {
                throw new BadRequestException("Comment was not liked");
            }
        } catch (ResourceNotFoundException | BadRequestException e) {
            logger.error("Error unliking comment: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while unliking comment: {}", e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while unliking the comment");
        }
    }

    public int getLikesCountForPost(String postId) {
        try {
            List<Like> likes = likesRepository.findByPostIdContaining(postId);
            return likes.size();
        } catch (Exception e) {
            logger.error("Error fetching likes count for post ID {}: {}", postId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while fetching likes count for the post");
        }
    }

    public List<Like> getLikesForComment(String commentId) {
        try {
            return likesRepository.findByCommentIdContaining(commentId);
        } catch (Exception e) {
            logger.error("Error fetching likes for comment ID {}: {}", commentId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while fetching likes for the comment");
        }
    }

    public List<Like> getLikesForUser(String userId) {
        try {
            return likesRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error fetching likes for user ID {}: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while fetching likes for the user");
        }
    }
}
