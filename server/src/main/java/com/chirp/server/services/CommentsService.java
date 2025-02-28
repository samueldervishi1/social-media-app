package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Comments;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentsService {

	private static final Logger logger = LoggerFactory.getLogger(CommentsService.class);

	private final UserRepository userRepository;
	private final PostRepository postRepository;

	public CommentsService(UserRepository userRepository , PostRepository postRepository) {
		this.userRepository = userRepository;
		this.postRepository = postRepository;
	}

	@Transactional
	public Comments createComment(String userId , String postId , Comments comment) {
		try {
			User user = getUserById(userId);
			Post post = getPostById(postId);

			comment.setUserId(user.getId());
			List<Comments> comments = post.getCommentsList();
			comments.add(comment);
			post.setCommentsList(comments);

			Post savedPost = postRepository.save(post);
			logger.info("Comment created with ID: {} for post: {}" , comment.getId() , savedPost.getId());
			return comment;
		} catch (CustomException e) {
			logger.error("Error creating comment: {}" , e.getMessage());
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while creating comment: {}" , e.getMessage());
			throw new CustomException(500 , "An unexpected error occurred while creating the comment");
		}
	}

	@Transactional
	public void deleteComment(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			Comments comment = getCommentFromPost(post , commentId).orElseThrow(() ->
					new CustomException(404 , "Comment not found: " + commentId));

			List<Comments> comments = post.getCommentsList();
			comments.remove(comment);
			post.setCommentsList(comments);

			Post savedPost = postRepository.save(post);
			logger.info("Comment {} deleted from post {}" , commentId , savedPost.getId());
		} catch (CustomException e) {
			logger.error("Error deleting comment: {}" , e.getMessage());
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while deleting comment: {}" , e.getMessage());
			throw new CustomException(500 , "An unexpected error occurred while deleting the comment");
		}
	}

	public Optional<Comments> getCommentById(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			return getCommentFromPost(post , commentId);
		} catch (CustomException e) {
			logger.error("Error retrieving comment: {}" , e.getMessage());
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while retrieving comment: {}" , e.getMessage());
			throw new CustomException(500 , "An unexpected error occurred while retrieving the comment");
		}
	}

	private User getUserById(String userId) {
		return userRepository.findById(userId).orElseThrow(() -> {
			logger.warn("User not found: {}" , userId);
			return new CustomException(404 , "User not found: " + userId);
		});
	}

	private Post getPostById(String postId) {
		return postRepository.findById(postId).orElseThrow(() -> {
			logger.warn("Post not found: {}" , postId);
			return new CustomException(404 , "Post not found: " + postId);
		});
	}

	private Optional<Comments> getCommentFromPost(Post post , String commentId) {
		return post.getCommentsList().stream()
				.filter(comment -> comment.getId().equals(commentId))
				.findFirst()
				.map(Optional::of)
				.orElseThrow(() -> {
					logger.warn("Comment {} not found in post {}" , commentId , post.getId());
					return new CustomException(404 , "Comment not found: " + commentId);
				});
	}
}