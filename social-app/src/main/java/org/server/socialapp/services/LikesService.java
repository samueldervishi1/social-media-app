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
    public Like likePost(String userId, String postId) throws Exception {
        return likeEntity(userId, postId, true);
    }

    @Transactional
    public Like likeComment(String userId, String commentId) throws Exception {
        return likeEntity(userId, commentId, false);
    }

    private Like likeEntity(String userId, String entityId, boolean isPost) throws Exception {
        try {
            Like like = getUserLike(userId);
            List<String> entityIds = isPost ? like.getPostId() : like.getCommentId();
            String entityType = isPost ? "post" : "comment";

            if (entityIds == null) {
                entityIds = new ArrayList<>();
                if (isPost) {
                    like.setPostId(entityIds);
                } else {
                    like.setCommentId(entityIds);
                }
            }

            if (entityIds.contains(entityId)) {
                throw new BadRequestException(entityType + " is already liked");
            }

            entityIds.add(entityId);
            likesRepository.save(like);

            if (isPost) {
                updatePostLikes(userId, entityId);
            } else {
                updateActivityLog(userId, "liked comment with id " + entityId);
            }

            return like;
        } catch (BadRequestException e) {
            handleException(e, "liking " + (isPost ? "post" : "comment"));
            return null;
        }
    }

    private Like getUserLike(String userId) {
        List<Like> userLikes = likesRepository.findByUserId(userId);
        return userLikes.isEmpty() ? new Like(userId) : userLikes.get(0);
    }

    private void updatePostLikes(String userId, String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getLikes().contains(userId)) {
            post.getLikes().add(userId);
        }
        postRepository.save(post);
        updateActivityLog(userId, "liked post with id " + postId);
    }

    private void updateActivityLog(String userId, String actionDescription) {
        String activityDescription = userId + " " + actionDescription;
        List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

        if (!existingActivities.isEmpty()) {
            existingActivities.forEach(activity -> {
                activity.getActionType().getAllActivity().add(activityDescription);
                activityRepository.save(activity);
            });
        } else {
            ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
            ActivityModel activity = new ActivityModel(actionType, userId, Instant.now(), "active");
            activityRepository.save(activity);
        }
    }

    @Transactional
    public void unlikePost(String userId, String postId) throws Exception {
        unlikeEntity(userId, postId, true);
    }

    @Transactional
    public void unlikeComment(String userId, String commentId) throws Exception {
        unlikeEntity(userId, commentId, false);
    }

    private void unlikeEntity(String userId, String entityId, boolean isPost) throws Exception {
        try {
            List<Like> userLikes = likesRepository.findByUserId(userId);
            if (userLikes.isEmpty()) {
                throw new ResourceNotFoundException("User has not liked any " + (isPost ? "posts" : "comments"));
            }

            Like like = userLikes.get(0);
            List<String> entityIds = isPost ? like.getPostId() : like.getCommentId();

            if (entityIds != null && entityIds.remove(entityId)) {
                likesRepository.save(like);
            } else {
                throw new BadRequestException((isPost ? "Post" : "Comment") + " was not liked");
            }
        } catch (BadRequestException | ResourceNotFoundException e) {
            handleException(e, "unliking " + (isPost ? "post" : "comment"));
        }
    }

    private void handleException(Exception e, String action) throws Exception {
        if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
            logger.error("Error {}: {}", action, e.getMessage(), e);
            throw e;
        } else {
            logger.error("Unexpected error while {}: {}", action, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while " + action);
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
