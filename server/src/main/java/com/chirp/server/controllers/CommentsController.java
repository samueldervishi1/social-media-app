package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Comments;
import com.chirp.server.services.CommentsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/posts/comments")
public class CommentsController {

	private final CommentsService commentsService;

	public CommentsController(CommentsService commentsService) {
		this.commentsService = commentsService;
	}

	@GetMapping("/get/{postId}/{commentId}")
	public Comments getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		System.out.println("Retrieving comment with ID: " + commentId + " for postId: " + postId);
		return commentsService.getCommentById(postId , commentId)
				.orElseThrow(() -> new CustomException(404 , "Comment not found for postId: " + postId));
	}

	@PostMapping("/create/{userId}/{postId}")
	public Comments create(@PathVariable String userId , @PathVariable String postId , @RequestBody Comments comments) {
		System.out.println("Comments created for postId: " + postId + " by user: " + userId);
		return commentsService.createComment(userId , postId , comments);
	}

	@DeleteMapping("/delete/{postId}/{commentId}")
	public String deleteComment(@PathVariable String postId , @PathVariable String commentId) {
		System.out.println("Deleting comment with ID: " + commentId + " for postId: " + postId);
		try {
			commentsService.deleteComment(postId , commentId);
			return "Comment with ID: " + commentId + " has been deleted successfully.";
		} catch (CustomException e) {
			return "Error: " + e.getMessage();
		}
	}
}