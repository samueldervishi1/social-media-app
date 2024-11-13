package com.chirp.server.controllers;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.ResourceNotFoundException;
import com.chirp.server.models.Like;
import com.chirp.server.services.LikesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/likes")
public class LikesController {

	@Autowired
	private LikesService likesService;

	@PostMapping("/post/{userId}/{postId}")
	public ResponseEntity<Like> likePost(@PathVariable String userId , @PathVariable String postId) {
		try {
			Like like = likesService.likePost(userId , postId);
			return ResponseEntity.ok(like);
		} catch (BadRequestException e) {
			return ResponseEntity.badRequest().body(null);
		} catch (ResourceNotFoundException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(null);
		}
	}

	@PostMapping("/comment/{userId}/{commentId}")
	public ResponseEntity<Like> likeComment(@PathVariable String userId , @PathVariable String commentId) {
		try {
			Like like = likesService.likeComment(userId , commentId);
			return ResponseEntity.ok(like);
		} catch (BadRequestException e) {
			return ResponseEntity.badRequest().body(null);
		} catch (ResourceNotFoundException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(null);
		}
	}

	@GetMapping("/post/{postId}")
	public ResponseEntity<Integer> getLikesCountForPost(@PathVariable String postId) {
		int count = likesService.getLikesCountForPost(postId);
		return ResponseEntity.ok(count);
	}

	@GetMapping("/comment/{commentId}")
	public ResponseEntity<List<Like>> getLikesForComment(@PathVariable String commentId) {
		List<Like> likes = likesService.getLikesForComment(commentId);
		return ResponseEntity.ok(likes);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<List<Like>> getLikesForUser(@PathVariable String userId) {
		List<Like> likes = likesService.getLikesForUser(userId);
		return ResponseEntity.ok(likes);
	}
}
