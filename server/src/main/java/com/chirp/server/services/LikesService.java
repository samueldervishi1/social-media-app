package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.ResourceNotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.Like;
import com.chirp.server.models.Post;
import com.chirp.server.repositories.LikesRepository;
import com.chirp.server.repositories.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class LikesService {

	private static final Logger logger = LoggerFactory.getLogger(LikesService.class);

	private final LikesRepository likesRepository;
	private final PostRepository postRepository;
	private final ActivityService activityService;

	public LikesService(LikesRepository likesRepository , PostRepository postRepository , ActivityService activityService) {
		this.likesRepository = likesRepository;
		this.postRepository = postRepository;
		this.activityService = activityService;
	}

	@Transactional
	public Like likePost(String userId , String postId) {
		Like like = handleLike(userId , postId , true);
		activityService.updateOrCreateActivity(userId , new ActivityModel.ActionType(List.of("Liked post")) , "Post liked successfully");
		return like;
	}

	@Transactional
	public Like likeComment(String userId , String commentId) {
		Like like = handleLike(userId , commentId , false);
		activityService.updateOrCreateActivity(userId , new ActivityModel.ActionType(List.of("Liked comment")) , "Comment liked successfully");
		return like;
	}

	public int getLikesCountForPost(String postId) {
		try {
			return likesRepository.findByPostIdContaining(postId).size();
		} catch (Exception e) {
			logAndHandleException(e , "getting likes count for post");
			return 0;
		}
	}

	public List<Like> getLikesForComment(String commentId) {
		return fetchLikesByEntity(likesRepository.findByCommentIdContaining(commentId) , commentId , "comment");
	}

	public List<Like> getLikesForUser(String userId) {
		return fetchLikesByEntity(likesRepository.findByUserId(userId) , userId , "user");
	}

	private Like handleLike(String userId , String entityId , boolean isPost) {
		String entityType = isPost ? "post" : "comment";
		try {
			Like like = likesRepository.findByUserId(userId).stream()
					.findFirst()
					.orElse(new Like(userId));

			List<String> entityIds = isPost ? like.getPostId() : like.getCommentId();
			if (entityIds == null) {
				entityIds = new ArrayList<>();
				if (isPost) {
					like.setPostId(entityIds);
				} else {
					like.setCommentId(entityIds);
				}
			}

			if (entityIds.contains(entityId)) {
				throw new BadRequestException(entityType + " is already liked.");
			}

			entityIds.add(entityId);
			likesRepository.save(like);

			if (isPost) {
				incrementPostLikes(userId , entityId);
			}

			return like;
		} catch (Exception e) {
			logAndHandleException(e , "liking " + entityType);
			throw e;
		}
	}

	private void incrementPostLikes(String userId , String postId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found."));

		if (!post.getLikes().contains(userId)) {
			post.getLikes().add(userId);
			postRepository.save(post);
		}
	}

	private List<Like> fetchLikesByEntity(List<Like> likes , String entityId , String entityType) {
		if (likes.isEmpty()) {
			logger.info("No likes found for {} with ID {}" , entityType , entityId);
		}
		return likes;
	}

	private void logAndHandleException(Exception e , String action) {
		if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
			logger.error("Error during {}: {}" , action , e.getMessage());
		} else {
			logger.error("Unexpected error during {}: {}" , action , e.getMessage());
			throw new InternalServerErrorException("An unexpected error occurred while " + action);
		}
	}
}