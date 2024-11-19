package com.chirp.server.controllers;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.Comments;
import com.chirp.server.services.CommentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/posts/comments")
public class CommentsController {

	@Autowired
	private CommentsService commentsService;

	@GetMapping("/get/{postId}/{commentId}")
	public Comments getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		System.out.println("Retrieving comment with ID: " + commentId + " for postId: " + postId);
		return commentsService.getCommentById(postId , commentId);
	}

	@PostMapping("/create/{userId}/{postId}")
	public Comments create(@PathVariable String userId , @PathVariable String postId , @RequestBody Comments comments) {
		System.out.println("Comments created for postId: " + postId + " by user: " + userId);
		return commentsService.createComment(userId , postId , comments);
	}

	@DeleteMapping("/delete/{postId}/{commentId}")
	public ResponseEntity<String> deleteComment(@PathVariable String postId , @PathVariable String commentId) {
		try {
			commentsService.deleteComment(postId , commentId);
			return ResponseEntity.ok("Comment with ID: " + commentId + " has been deleted successfully.");
		} catch (NotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found.");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting the comment.");
		}
	}
}
