package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Comment;
import com.chattr.server.services.CommentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing comments on posts.
 */
@RestController
@RequestMapping("/comments")
public class CommentsController {

	private final CommentsService commentsService;

	/**
	 * Constructor-based dependency injection for the CommentsService.
	 *
	 * @param commentsService service for comment-related operations
	 */
	public CommentsController(CommentsService commentsService) {
		this.commentsService = commentsService;
	}

	/**
	 * Retrieve a specific comment by postId and commentId.
	 *
	 * @param postId    ID of the post
	 * @param commentId ID of the comment
	 * @return the comment if found
	 * @throws CustomException if the comment does not exist
	 */
	@GetMapping("/get/{postId}/{commentId}")
	public ResponseEntity<Comment> getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		Comment comment = commentsService.getCommentById(postId , commentId)
				.orElseThrow(() ->
						new CustomException(404 , String.format(Messages.COMMENT_NOT_FOUND , commentId))
				);

		return ResponseEntity.ok(comment);
	}

	/**
	 * Create a new comment under a specific post by a user.
	 *
	 * @param userId  ID of the user posting the comment
	 * @param postId  ID of the post the comment is for
	 * @param comment the comment body
	 * @return the newly created comment
	 */
	@PostMapping("/create/{userId}/{postId}")
	public ResponseEntity<Comment> createComment(@PathVariable String userId ,
	                                             @PathVariable String postId ,
	                                             @RequestBody Comment comment) {
		Comment created = commentsService.createComment(userId , postId , comment);
		return ResponseEntity.ok(created);
	}

	/**
	 * Delete a specific comment under a post.
	 *
	 * @param postId    ID of the post
	 * @param commentId ID of the comment
	 * @return success message
	 */
	@DeleteMapping("/delete/{postId}/{commentId}")
	public ResponseEntity<String> deleteComment(@PathVariable String postId ,
	                                            @PathVariable String commentId) {
		commentsService.deleteComment(postId , commentId);
		return ResponseEntity.ok("Comment with ID: " + commentId + " has been deleted successfully.");
	}
}