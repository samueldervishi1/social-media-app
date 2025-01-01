package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.SavePost;
import com.chirp.server.repositories.SavePostRepository;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.models.ActivityModel.ActionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavePostService {
	private static final Logger logger = LoggerFactory.getLogger(SavePostService.class);

	private final SavePostRepository savePostRepository;
	private final UserRepository userRepository;
	private final ActivityService activityService;

	public SavePostService(SavePostRepository savePostRepository , UserRepository userRepository , ActivityService activityService) {
		this.savePostRepository = savePostRepository;
		this.userRepository = userRepository;
		this.activityService = activityService;
	}

	public SavePost savePosts(String userId , List<String> postIds) {
		try {
			if (!userRepository.existsById(userId)) {
				logAndThrow("User {} does not exist" , userId , NotFoundException.class);
			}

			SavePost savePost = savePostRepository.findByUserId(userId)
					.map(existingPost -> addNewPostIds(existingPost , postIds , userId))
					.orElse(new SavePost(userId , postIds));

			String actionTypeString = userId + " saved a post";
			ActionType actionType = new ActionType(List.of(actionTypeString));
			activityService.updateOrCreateActivity(userId , actionType , "Post saved successfully");

			return savePostRepository.save(savePost);
		} catch (Exception e) {
			logAndThrow("Unexpected error while saving posts for user {}: {}" , userId , e.getMessage() , InternalServerErrorException.class , e);
		}
		return null;
	}

	private SavePost addNewPostIds(SavePost savePost , List<String> postIds , String userId) {
		List<String> newPostIds = postIds.stream()
				.filter(postId -> !savePost.getPostIds().contains(postId))
				.toList();
		if (newPostIds.isEmpty()) {
			logAndThrow("User {} is trying to save posts that are already saved" , userId , BadRequestException.class);
		}
		savePost.getPostIds().addAll(newPostIds);
		return savePost;
	}

	public void unsavePost(String userId , String postId) {
		try {
			SavePost savePost = savePostRepository.findByUserId(userId)
					.orElseThrow(() -> new NotFoundException("No saved posts found for user " + userId));

			if (savePost.getPostIds().remove(postId)) {
				savePostRepository.save(savePost);

				// Log activity when a post is unsaved
				String actionTypeString = userId + " unsaved a post";
				ActionType actionType = new ActionType(List.of(actionTypeString));
				activityService.updateOrCreateActivity(userId , actionType , "Post unsaved successfully");

				logger.info("Post {} unsaved successfully for user {}" , postId , userId);
			} else {
				logger.warn("Post {} not found in saved posts for user {}" , postId , userId);
				throw new NotFoundException("Post " + postId + " not found in saved posts for user " + userId);
			}
		} catch (NotFoundException e) {
			logAndThrow("Error unsaving post for user {}: {}" , userId , e.getMessage() , NotFoundException.class , e);
		} catch (Exception e) {
			logAndThrow("Unexpected error while unsaving post for user {}: {}" , userId , e.getMessage() , InternalServerErrorException.class , e);
		}
	}

	public SavePost getSavedPostsForUser(String userId) {
		logger.info("Fetching saved posts for user {}" , userId);

		try {
			Optional<SavePost> savedPostsOptional = savePostRepository.findByUserId(userId);

			if (savedPostsOptional.isPresent()) {
				logger.info("Saved posts found for user {}: {}" , userId , savedPostsOptional.get().getPostIds());
				return savedPostsOptional.get();
			} else {
				logger.warn("No saved posts found for user {}" , userId);
				return null;
			}
		} catch (Exception e) {
			logAndThrow("Error fetching saved posts for user {}: {}" , userId , e.getMessage() , InternalServerErrorException.class , e);
		}
		return null;
	}

	public int getNumberOfSavedPosts(String postId) {
		try {
			return savePostRepository.countByPostId(postId);
		} catch (Exception e) {
			logAndThrow("Error fetching saved count for post ID {}: {}" , postId , e.getMessage() , InternalServerErrorException.class , e);
		}
		return 0;
	}

	private void logAndThrow(String message , String userId , Class<? extends RuntimeException> exceptionClass) {
		logger.error(message , userId);
		try {
			throw exceptionClass.getConstructor(String.class).newInstance(String.format(message , userId));
		} catch (Exception e) {
			throw new RuntimeException("Error while throwing exception" , e);
		}
	}

	private void logAndThrow(String message , String userId , String additionalMessage , Class<? extends RuntimeException> exceptionClass , Exception e) {
		logger.error(message , userId , additionalMessage , e);
		try {
			throw exceptionClass.getConstructor(String.class).newInstance(String.format(message , userId , additionalMessage));
		} catch (Exception ex) {
			throw new RuntimeException("Error while throwing exception" , ex);
		}
	}
}