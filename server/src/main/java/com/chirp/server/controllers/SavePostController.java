package com.chirp.server.controllers;

import com.chirp.server.models.SavePost;
import com.chirp.server.services.SavePostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/save/posts")
public class SavePostController {

	@Autowired
	private SavePostService savePostService;

	@GetMapping("/{userId}")
	public ResponseEntity<SavePost> getSavedPostsForUser(@PathVariable String userId) {
		SavePost savedPosts = savePostService.getSavedPostsForUser(userId);
		if (savedPosts != null) {
			return ResponseEntity.ok(savedPosts);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/{postId}/saved-count")
	public ResponseEntity<?> getNumberOfSavedPosts(@PathVariable String postId) {
		try {
			int savedCount = savePostService.getNumberOfSavedPosts(postId);
			return ResponseEntity.ok(savedCount);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("An error occurred while fetching the saved count.");
		}
	}

	@PostMapping("/{userId}")
	public ResponseEntity<SavePost> savePosts(@PathVariable String userId , @RequestBody List<String> postIds) {
		try {
			SavePost savedPost = savePostService.savePosts(userId , postIds);
			return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
	}

	@DeleteMapping("/{userId}/{postId}")
	public ResponseEntity<String> unsavePost(@PathVariable String userId , @PathVariable String postId) {
		try {
			savePostService.unsavePost(userId , postId);
			return ResponseEntity.ok("Post unsaved successfully");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
}