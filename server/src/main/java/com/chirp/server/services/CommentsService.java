package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.Comments;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.ActivityRepository;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
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

	private User getUserById(String userId) {
		return userRepository.findById(userId).orElseThrow(() -> {
			logger.warn("User not found with userId: {}" , userId);
			return new NotFoundException("User not found with userId: " + userId);
		});
	}

	private Post getPostById(String postId) {
		return postRepository.findById(postId).orElseThrow(() -> {
			logger.warn("Post not found with ID: {}" , postId);
			return new NotFoundException("Post not found with ID: " + postId);
		});
	}

	private void handleActivity(String userId , String postId , Comments comment) {
		String activityDescription = "created comment with id " + comment.getId() + " on post with id " + postId;
		List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

		if (!existingActivities.isEmpty()) {
			for (ActivityModel activity : existingActivities) {
				activity.getActionType().getAllActivity().add(activityDescription);
				activityRepository.save(activity);
			}
		} else {
			ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
			ActivityModel activity = new ActivityModel(actionType , userId , Instant.now() , "active");
			activityRepository.save(activity);
		}
	}

	@Transactional
	public Comments createComment(String userId , String postId , Comments comment) {
		try {
			User user = getUserById(userId);
			Post post = getPostById(postId);

			comment.setUserId(user.getId());
			post.getCommentsList().add(comment);

			postRepository.save(post);

			handleActivity(userId , postId , comment);

			logger.info("Comment created with ID: {}" , comment.getId());
			return comment;
		} catch (NotFoundException e) {
			logger.error("Error creating comment: {}" , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while creating comment. Error: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while creating the comment");
		}
	}

	public Comments getCommentById(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			Optional<Comments> commentOptional = post.getCommentsList().stream()
					.filter(comment -> comment.getId().equals(commentId))
					.findFirst();

			if (commentOptional.isEmpty()) {
				logger.warn("Comment not found with ID: {} in post with ID: {}" , commentId , postId);
				throw new NotFoundException("Comment not found with ID: " + commentId);
			}

			return commentOptional.get();
		} catch (NotFoundException e) {
			logger.error("Error retrieving comment: {}" , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while retrieving comment. Error: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while retrieving the comment");
		}
	}
}
