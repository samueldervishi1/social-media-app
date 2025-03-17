package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Comments;
import com.chirp.server.services.CommentsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hyper-api/auranet/v2.1.5/reverb")
public class CommentsController {

	private final CommentsService commentsService;

	public CommentsController(CommentsService commentsService) {
		this.commentsService = commentsService;
	}

	@GetMapping("/fetch-relic/{postId}/{commentId}")
	public Comments getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		return commentsService.getCommentById(postId , commentId)
				.orElseThrow(() -> new CustomException(404 , "Comment not found for postId: " + postId));
	}

	@PostMapping("/deploy/{userId}/{postId}")
	public Comments create(@PathVariable String userId , @PathVariable String postId , @RequestBody Comments comments) {
		return commentsService.createComment(userId , postId , comments);
	}

	@DeleteMapping("/purge/{postId}/{commentId}")
	public String deleteComment(@PathVariable String postId , @PathVariable String commentId) {
		try {
			commentsService.deleteComment(postId , commentId);
			return "Comment with ID: " + commentId + " has been deleted successfully.";
		} catch (CustomException e) {
			return "Error: " + e.getMessage();
		}
	}
}