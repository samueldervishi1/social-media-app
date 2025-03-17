package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Comments;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentsService {

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

			postRepository.save(post);
			return comment;
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
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

			postRepository.save(post);
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
			throw new CustomException(500 , "An unexpected error occurred while deleting the comment");
		}
	}

	@Cacheable(value = "comments", key = "#postId + ':' + #commentId")
	public Optional<Comments> getCommentById(String postId , String commentId) {
		try {
			Post post = getPostById(postId);
			return getCommentFromPost(post , commentId);
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
			throw new CustomException(500 , "An unexpected error occurred while retrieving the comment");
		}
	}

	private User getUserById(String userId) {
		return userRepository.findById(userId).orElseThrow(() -> new CustomException(404 , "User not found: " + userId));
	}

	private Post getPostById(String postId) {
		return postRepository.findById(postId).orElseThrow(() -> new CustomException(404 , "Post not found: " + postId));
	}

	private Optional<Comments> getCommentFromPost(Post post , String commentId) {
		return post.getCommentsList().stream()
				.filter(comment -> comment.getId().equals(commentId))
				.findFirst()
				.map(Optional::of)
				.orElseThrow(() -> new CustomException(404 , "Comment not found: " + commentId));
	}
}