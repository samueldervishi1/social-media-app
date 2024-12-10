package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.Comments;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentsService {

	private static final Logger logger = LoggerFactory.getLogger(CommentsService.class);

	private final UserRepository userRepository;
	private final PostRepository postRepository;

	public CommentsService(UserRepository userRepository , PostRepository postRepository) {
		this.userRepository = userRepository;
		this.postRepository = postRepository;
	}

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

	private Comments getCommentFromPost(Post post , String commentId) {
		return post.getCommentsList().stream()
				.filter(comment -> comment.getId().equals(commentId))
				.findFirst()
				.orElseThrow(() -> {
					logger.warn("Comment not found with ID: {} in post with ID: {}" , commentId , post.getId());
					return new NotFoundException("Comment not found with ID: " + commentId);
				});
	}

	@Transactional
	public Comments createComment(String userId , String postId , Comments comment) {
		try {
			User user = getUserById(userId);
			Post post = getPostById(postId);

			comment.setUserId(user.getId());
			post.getCommentsList().add(comment);

			postRepository.save(post);

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

	@Transactional
	public void deleteComment(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			Comments comment = getCommentFromPost(post , commentId);

			post.getCommentsList().remove(comment);
			postRepository.save(post);

			logger.info("Comment with ID: {} has been deleted from post with ID: {}" , commentId , postId);
		} catch (NotFoundException e) {
			logger.error("Error deleting comment: {}" , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while deleting comment. Error: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while deleting the comment");
		}
	}

	public Comments getCommentById(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			return getCommentFromPost(post , commentId);
		} catch (NotFoundException e) {
			logger.error("Error retrieving comment: {}" , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while retrieving comment. Error: {}" , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while retrieving the comment");
		}
	}
}