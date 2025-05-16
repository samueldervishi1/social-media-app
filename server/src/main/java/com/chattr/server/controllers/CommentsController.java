package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Comment;
import com.chattr.server.services.CommentsService;
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
	@GetMapping("/{postId}/{commentId}")
	public Comment getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		return commentsService.getCommentById(postId , commentId)
				.orElseThrow(() ->
						new CustomException(404 , String.format(Messages.COMMENT_NOT_FOUND , commentId))
				);
	}

	/**
	 * Create a new comment under a specific post by a user.
	 *
	 * @param userId  ID of the user posting the comment
	 * @param postId  ID of the post the comment is for
	 * @param comment the comment body
	 * @return the newly created comment
	 */
	@PostMapping("/{userId}/{postId}")
	public Comment createComment(@PathVariable String userId ,
	                             @PathVariable String postId ,
	                             @RequestBody Comment comment) {
		return commentsService.createComment(userId , postId , comment);
	}

	/**
	 * Delete a specific comment under a post.
	 *
	 * @param postId    ID of the post
	 * @param commentId ID of the comment
	 * @return success or error message
	 */
	@DeleteMapping("/{postId}/{commentId}")
	public String deleteComment(@PathVariable String postId , @PathVariable String commentId) {
		try {
			commentsService.deleteComment(postId , commentId);
			return "Comment with ID: " + commentId + " has been deleted successfully.";
		} catch (CustomException e) {
			return "Error: " + e.getMessage();
		}
	}
}