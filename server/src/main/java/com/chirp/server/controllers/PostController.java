package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Post;
import com.chirp.server.services.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
		} catch (CustomException e) {
			logError(postId , e.getMessage() , e);
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	@GetMapping("/list/{userId}")
	public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
		try {
			List<Post> posts = postService.getUserPosts(userId);
			return ResponseEntity.ok(posts);
		} catch (CustomException e) {
			logError(userId , e.getMessage() , e);
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	@GetMapping("/list/count/{userId}")
	public long getUserPostCount(@PathVariable String userId) {
		try {
			return postService.getPostCountPerUser(userId);
		} catch (CustomException e) {
			logError(userId , e.getMessage() , e);
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@GetMapping("/all")
	public ResponseEntity<List<Post>> getAllPosts() {
		try {
			List<Post> posts = postService.getAllPosts();
			return ResponseEntity.ok(posts);
		} catch (CustomException e) {
			logError("all posts" , e.getMessage() , e);
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	@PostMapping("/create/{username}")
	public ResponseEntity<String> create(
			@PathVariable String username ,
			@RequestBody Post post) {

		try {
			postService.createPost(username , post);
			return ResponseEntity.ok("Post created successfully");
		} catch (CustomException e) {
			logError(username , e.getMessage() , e);
			return ResponseEntity.status(e.getCode()).body("Error creating post");
		}
	}

	@DeleteMapping("/delete/{postId}")
	public ResponseEntity<String> deletePost(@PathVariable String postId) {
		try {
			postService.deletePost(postId);
			return ResponseEntity.ok("Post soft deleted successfully!");
		} catch (CustomException e) {
			logError(postId , e.getMessage() , e);
			return ResponseEntity.status(e.getCode()).body("Error deleting post");
		}
	}

	private void logError(String id , String message , Exception e) {
		logger.error("Error with ID {}: {}" , id , message , e);
	}
}