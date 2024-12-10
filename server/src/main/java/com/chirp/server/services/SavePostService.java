package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.SavePost;
import com.chirp.server.repositories.SavePostRepository;
import com.chirp.server.repositories.UserRepository;
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

	public SavePostService(SavePostRepository savePostRepository , UserRepository userRepository) {
		this.savePostRepository = savePostRepository;
		this.userRepository = userRepository;
	}

	public SavePost savePosts(String userId , List<String> postIds) {
		try {
			if (!userRepository.existsById(userId)) {
				logAndThrowNotFoundException("User {} does not exist" , userId);
			}

			SavePost savePost = savePostRepository.findByUserId(userId)
					.map(existingPost -> addNewPostIds(existingPost , postIds , userId))
					.orElse(new SavePost(userId , postIds));

			return savePostRepository.save(savePost);
		} catch (Exception e) {
			logger.error("Unexpected error while saving posts for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while saving posts");
		}
	}

	private SavePost addNewPostIds(SavePost savePost , List<String> postIds , String userId) {
		List<String> newPostIds = postIds.stream()
				.filter(postId -> !savePost.getPostIds().contains(postId))
				.toList();
		if (newPostIds.isEmpty()) {
			logAndThrowBadRequestException("User {} is trying to save posts that are already saved" , userId);
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
				logger.info("Post {} unsaved successfully for user {}" , postId , userId);
			} else {
				logger.warn("Post {} not found in saved posts for user {}" , postId , userId);
				throw new NotFoundException("Post " + postId + " not found in saved posts for user " + userId);
			}

		} catch (NotFoundException e) {
			logger.error("Error unsaving post for user {}: {}" , userId , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while unsaving post for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while unsaving the post");
		}
	}

	public SavePost getSavedPostsForUser(String userId) {
		try {
			Optional<SavePost> savedPostsOptional = savePostRepository.findByUserId(userId);
			return savedPostsOptional.orElse(null);
		} catch (Exception e) {
			logger.error("Error fetching saved posts for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching saved posts");
		}
	}

	public int getNumberOfSavedPosts(String postId) {
		try {
			return savePostRepository.countByPostId(postId);
		} catch (Exception e) {
			logger.error("Error fetching saved count for post ID {}: {}" , postId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching saved count for the post");
		}
	}

	private void logAndThrowNotFoundException(String message , String userId) {
		logger.error(message , userId);
		throw new NotFoundException(String.format(message , userId));
	}

	private void logAndThrowBadRequestException(String message , String userId) {
		logger.error(message , userId);
		throw new BadRequestException(String.format(message , userId));
	}
}