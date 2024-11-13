package com.chirp.server.controllers;

import com.chirp.server.models.Comments;
import com.chirp.server.services.CommentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/posts/comments")
public class CommentsController {

	@Autowired
	private CommentsService commentsService;

	@PostMapping("/create/{userId}/{postId}")
	public Comments create(@PathVariable String userId , @PathVariable String postId , @RequestBody Comments comments) {
		System.out.println("Comments created for postId: " + postId + " by user: " + userId);
		return commentsService.createComment(userId , postId , comments);
	}

	@GetMapping("/get/{postId}/{commentId}")
	public Comments getCommentById(@PathVariable String postId , @PathVariable String commentId) {
		System.out.println("Retrieving comment with ID: " + commentId + " for postId: " + postId);
		return commentsService.getCommentById(postId , commentId);
	}
}
