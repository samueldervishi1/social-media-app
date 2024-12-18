package com.chirp.server.controllers;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.Post;
import com.chirp.server.services.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v2/posts")
public class PostController {

	private static final Logger logger = LoggerFactory.getLogger(PostController.class);

	private final PostService postService;

	public PostController(PostService postService) {
		this.postService = postService;
	}

	@GetMapping("/{postId}")
	public ResponseEntity<Post> getPost(@PathVariable String postId) {
		try {
			Post post = postService.getPostById(postId);
			return ResponseEntity.ok(post);
		} catch (NotFoundException e) {
			logError(postId , "Post not found" , e , true);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		} catch (InternalServerErrorException e) {
			logError(postId , "Error retrieving post" , e , false);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		} catch (Exception e) {
			logError(postId , "Unexpected error retrieving post" , e , false);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/list/{userId}")
	public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
		try {
			List<Post> posts = postService.getUserPosts(userId);
			return ResponseEntity.ok(posts);
		} catch (Exception e) {
			logger.error("Error retrieving posts for user {}: {}" , userId , e.getMessage() , e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/list/count/{userId}")
	public long getUserPostCount(@PathVariable String userId) {
		try {
			return postService.getPostCountPerUser(userId);
		} catch (Exception e) {
			logger.error("Error fetching post count for user ID {}: {}" , userId , e.getMessage());
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR , "Error fetching user post count");
		}
	}

	@GetMapping("/all")
	public ResponseEntity<List<Post>> getAllPosts() {
		try {
			List<Post> posts = postService.getAllPosts();
			return ResponseEntity.ok(posts);
		} catch (Exception e) {
			logger.error("Error retrieving all posts: {}" , e.getMessage() , e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PostMapping("/create/{username}")
	public ResponseEntity<String> create(
			@PathVariable String username ,
			@RequestBody Post post) {

		logger.debug("Received POST request to create a post for user: {}" , username);

		try {
			postService.createPost(username , post);

			return ResponseEntity.ok("Post created successfully");

		} catch (Exception e) {
			logger.error("Error creating post for user {}: {}" , username , e.getMessage() , e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating post");
		}
	}

	@DeleteMapping("/delete/{postId}")
	public ResponseEntity<String> deletePost(@PathVariable String postId) {
		try {
			postService.deletePost(postId);
			return ResponseEntity.ok("Post soft deleted successfully!");
		} catch (NotFoundException e) {
			logError(postId , "Post not found" , e , true);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
		} catch (InternalServerErrorException e) {
			logError(postId , "Error during soft delete" , e , false);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting post");
		} catch (Exception e) {
			logError(postId , "Unexpected error during soft delete" , e , false);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
		}
	}

	private void logError(String postId , String message , Exception e , boolean isWarning) {
		if (isWarning) {
			logger.warn("Post with ID {}: {}" , postId , message , e);
		} else {
			logger.error("Post with ID {}: {}" , postId , message , e);
		}
	}
}