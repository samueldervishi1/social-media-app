package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Post;
import com.chattr.server.services.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing posts: creation, retrieval, deletion, and user-specific queries.
 */
@RestController
@RequestMapping("/posts")
public class PostController {

	private final PostService postService;

	/**
	 * Constructor-based injection for the PostService.
	 *
	 * @param postService service layer for post-related operations
	 */
	public PostController(PostService postService) {
		this.postService = postService;
	}

	/**
	 * Retrieve a specific post by its ID.
	 *
	 * @param postId the unique identifier of the post
	 * @return the Post object or error status
	 */
	@GetMapping("/get/1/{postId}")
	public ResponseEntity<Post> getPost(@PathVariable String postId) {
		try {
			Post post = postService.getPostById(postId);
			return ResponseEntity.ok(post);
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	/**
	 * Get all posts created by a specific user.
	 *
	 * @param userId the user's identifier
	 * @return list of posts or error response
	 */
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
		try {
			List<Post> posts = postService.getUserPosts(userId);
			return ResponseEntity.ok(posts);
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	/**
	 * Get the number of posts made by a specific user.
	 *
	 * @param userId the user's identifier
	 * @return count of posts
	 */
	@GetMapping("/1/metrics/{userId}")
	public long getUserPostCount(@PathVariable String userId) {
		try {
			return postService.getPostCountPerUser(userId);
		} catch (CustomException e) {
			// Re-throw as-is to allow centralized handling (if configured)
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	/**
	 * Get all posts in the system.
	 *
	 * @return list of all posts
	 */
	@GetMapping("/all")
	public ResponseEntity<List<Post>> getAllPosts() {
		try {
			List<Post> posts = postService.getAllPosts();
			return ResponseEntity.ok(posts);
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(null);
		}
	}

	/**
	 * Create a new post by a user.
	 *
	 * @param username the author's username
	 * @param post     the post content
	 * @return confirmation message or error
	 */
	@PostMapping("/create/{username}")
	public ResponseEntity<String> createPost(@PathVariable String username , @RequestBody Post post) {
		try {
			postService.createPost(username , post);
			return ResponseEntity.ok("Post created successfully");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body("Error creating post");
		}
	}

	/**
	 * Soft-delete a post by its ID.
	 *
	 * @param postId the post's unique identifier
	 * @return confirmation or error message
	 */
	@DeleteMapping("/delete/{postId}")
	public ResponseEntity<String> deletePost(@PathVariable String postId) {
		try {
			postService.deletePost(postId);
			return ResponseEntity.ok("Post soft deleted successfully!");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body("Error deleting post");
		}
	}
}