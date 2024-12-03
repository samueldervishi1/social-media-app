package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.ResourceNotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.Like;
import com.chirp.server.models.Post;
import com.chirp.server.repositories.ActivityRepository;
import com.chirp.server.repositories.LikesRepository;
import com.chirp.server.repositories.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
	public Like likePost(String userId , String postId) throws Exception {
		return likeEntity(userId , postId , true);
	}

	@Transactional
	public Like likeComment(String userId , String commentId) throws Exception {
		return likeEntity(userId , commentId , false);
	}

	public Like likeEntity(String userId , String entityId , boolean isPost) throws Exception {
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
			updatePostLikes(userId , entityId);
		} else {
			updateActivityLog(userId , "liked comment with id " + entityId);
		}

		return like;
	}

	private void updatePostLikes(String userId , String postId) {
		Post post = getEntityById(postRepository.findById(postId) , postId);
		if (!post.getLikes().contains(userId)) {
			post.getLikes().add(userId);
		}
		postRepository.save(post);
		updateActivityLog(userId , "liked post with id " + postId);
	}

	private void updateActivityLog(String userId , String actionDescription) {
		String activityDescription = userId + " " + actionDescription;
		List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

		if (!existingActivities.isEmpty()) {
			existingActivities.forEach(activity -> {
				activity.getActionType().getAllActivity().add(activityDescription);
				activityRepository.save(activity);
			});
		} else {
			ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
			ActivityModel activity = new ActivityModel(actionType , userId , Instant.now() , "active");
			activityRepository.save(activity);
		}
	}

	public int getLikesCountForPost(String postId) {
		return getCountForEntity(likesRepository.findByPostIdContaining(postId) , postId);
	}

	public List<Like> getLikesForComment(String commentId) {
		return getLikesForEntity(likesRepository.findByCommentIdContaining(commentId) , commentId , "comment");
	}

	public List<Like> getLikesForUser(String userId) {
		return getLikesForEntity(likesRepository.findByUserId(userId) , userId , "user");
	}

	private <T> T getEntityById(Optional<T> entity , String identifier) {
		return entity.orElseThrow(() -> new ResourceNotFoundException("Post" + " with ID " + identifier + " not found"));
	}

	private List<Like> getLikesForEntity(List<Like> likes , String entityId , String entityType) {
		if (likes.isEmpty()) {
			logger.info("No likes found for " + entityType + " with ID {}" , entityId);
		}
		return likes;
	}

	private int getCountForEntity(List<Like> likes , String entityId) {
		int count = likes.size();
		logger.info("{} count for {} with ID {}: {}" , "post" , "post" , entityId , count);
		return count;
	}

	private Like getUserLike(String userId) {
		return likesRepository.findByUserId(userId).stream()
				.findFirst()
				.orElse(new Like(userId));
	}

	private void handleException(Exception e , String action) throws Exception {
		if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
			logger.error("Error {}: {}" , action , e.getMessage() , e);
			throw e;
		} else {
			logger.error("Unexpected error while {}: {}" , action , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while " + action);
		}
	}
}