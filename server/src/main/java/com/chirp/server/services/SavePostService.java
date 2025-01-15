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

@Service
public class SavePostService {
	private static final Logger logger = LoggerFactory.getLogger(SavePostService.class);
	private static final String USER_NOT_FOUND = "User %s does not exist";
	private static final String POSTS_ALREADY_SAVED = "User %s is trying to save posts that are already saved";
	private static final String NO_SAVED_POSTS = "No saved posts found for user %s";
	private static final String POST_NOT_FOUND = "Post %s not found in saved posts for user %s";
	private static final String UNEXPECTED_ERROR = "Unexpected error while %s for user %s: %s";

	private final SavePostRepository savePostRepository;
	private final UserRepository userRepository;
	private final ActivityService activityService;

	public SavePostService(SavePostRepository savePostRepository , UserRepository userRepository , ActivityService activityService) {
		this.savePostRepository = savePostRepository;
		this.userRepository = userRepository;
		this.activityService = activityService;
	}

	public SavePost savePosts(String userId , List<String> postIds) {
		if (!userRepository.existsById(userId)) {
			throw new NotFoundException(String.format(USER_NOT_FOUND , userId));
		}

		try {
			SavePost savePost = savePostRepository.findByUserId(userId)
					.map(existingPost -> addNewPostIds(existingPost , postIds , userId))
					.orElse(new SavePost(userId , postIds));

			createActivity(userId , "saved" , "Post saved successfully");
			return savePostRepository.save(savePost);
		} catch (BadRequestException e) {
			throw e;
		} catch (Exception e) {
			logger.error(UNEXPECTED_ERROR , "saving posts" , userId , e.getMessage() , e);
			throw new InternalServerErrorException(String.format(UNEXPECTED_ERROR , "saving posts" , userId , e.getMessage()));
		}
	}

	private SavePost addNewPostIds(SavePost savePost , List<String> postIds , String userId) {
		List<String> newPostIds = postIds.stream()
				.filter(postId -> !savePost.getPostIds().contains(postId))
				.toList();

		if (newPostIds.isEmpty()) {
			throw new BadRequestException(String.format(POSTS_ALREADY_SAVED , userId));
		}

		savePost.getPostIds().addAll(newPostIds);
		return savePost;
	}

	public void unsavePost(String userId , String postId) {
		try {
			SavePost savePost = savePostRepository.findByUserId(userId)
					.orElseThrow(() -> new NotFoundException(String.format(NO_SAVED_POSTS , userId)));

			if (!savePost.getPostIds().remove(postId)) {
				throw new NotFoundException(String.format(POST_NOT_FOUND , postId , userId));
			}

			savePostRepository.save(savePost);
			createActivity(userId , "unsaved" , "Post unsaved successfully");
			logger.info("Post {} unsaved successfully for user {}" , postId , userId);

		} catch (NotFoundException e) {
			throw e;
		} catch (Exception e) {
			logger.error(UNEXPECTED_ERROR , "unsaving post" , userId , e.getMessage() , e);
			throw new InternalServerErrorException(String.format(UNEXPECTED_ERROR , "unsaving post" , userId , e.getMessage()));
		}
	}

	public SavePost getSavedPostsForUser(String userId) {
		try {
			return savePostRepository.findByUserId(userId)
					.map(savedPosts -> {
						logger.info("Found {} saved posts for user {}" , savedPosts.getPostIds().size() , userId);
						return savedPosts;
					})
					.orElse(null);
		} catch (Exception e) {
			logger.error(UNEXPECTED_ERROR , "fetching saved posts" , userId , e.getMessage() , e);
			throw new InternalServerErrorException(String.format(UNEXPECTED_ERROR , "fetching saved posts" , userId , e.getMessage()));
		}
	}

	public int getNumberOfSavedPosts(String postId) {
		try {
			return savePostRepository.countByPostId(postId);
		} catch (Exception e) {
			logger.error("Error fetching saved count for post ID {}: {}" , postId , e.getMessage() , e);
			throw new InternalServerErrorException(String.format("Error getting saved count for post %s" , postId));
		}
	}

	private void createActivity(String userId , String action , String message) {
		String actionTypeString = userId + " " + action + " a post";
		activityService.updateOrCreateActivity(
				userId ,
				new ActionType(List.of(actionTypeString)) ,
				message
		);
	}
}