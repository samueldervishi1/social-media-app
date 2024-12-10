package com.chirp.server.controllers;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.SavePost;
import com.chirp.server.services.SavePostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/save/posts")
public class SavePostController {

	private static final Logger logger = LoggerFactory.getLogger(SavePostController.class);

	private final SavePostService savePostService;

	public SavePostController(SavePostService savePostService) {
		this.savePostService = savePostService;
	}

	@GetMapping("/{userId}")
	public ResponseEntity<SavePost> getSavedPostsForUser(@PathVariable String userId) {
		SavePost savedPosts = savePostService.getSavedPostsForUser(userId);
		if (savedPosts != null) {
			logger.info("Successfully fetched saved posts for user: {}" , userId);
			return ResponseEntity.ok(savedPosts);
		} else {
			logger.warn("No saved posts found for user: {}" , userId);
			throw new NotFoundException("No saved posts found for user: " + userId);
		}
	}

	@GetMapping("/{postId}/saved-count")
	public ResponseEntity<?> getNumberOfSavedPosts(@PathVariable String postId) {
		try {
			int savedCount = savePostService.getNumberOfSavedPosts(postId);
			logger.info("Successfully fetched saved count for post: {}" , postId);
			return ResponseEntity.ok(savedCount);
		} catch (Exception e) {
			logger.error("Error fetching saved count for post: {}" , postId , e);
			throw new BadRequestException("An error occurred while fetching the saved count.");
		}
	}

	@PostMapping("/{userId}")
	public ResponseEntity<SavePost> savePosts(@PathVariable String userId , @RequestBody List<String> postIds) {
		try {
			SavePost savedPost = savePostService.savePosts(userId , postIds);
			logger.info("Successfully saved posts for user: {}" , userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
		} catch (IllegalArgumentException e) {
			logger.error("Error saving posts for user: {}" , userId , e);
			throw new BadRequestException("Invalid post IDs provided for saving.");
		}
	}

	@DeleteMapping("/{userId}/{postId}")
	public ResponseEntity<String> unsavePost(@PathVariable String userId , @PathVariable String postId) {
		try {
			savePostService.unsavePost(userId , postId);
			logger.info("Successfully unsaved post for user: {}" , userId);
			return ResponseEntity.ok("Post unsaved successfully");
		} catch (IllegalArgumentException e) {
			logger.error("Error unsaving post: {} for user: {}" , postId , userId , e);
			throw new NotFoundException("Post not found or already unsaved.");
		}
	}
}