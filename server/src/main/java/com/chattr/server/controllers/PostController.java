package com.chattr.server.controllers;

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
	 * @return the Post object
	 */
	@GetMapping("/get/1/{postId}")
	public ResponseEntity<Post> getPost(@PathVariable String postId) {
		Post post = postService.getPostById(postId);
		return ResponseEntity.ok(post);
	}

	/**
	 * Get all posts created by a specific user.
	 *
	 * @param userId the user's identifier
	 * @return list of posts
	 */
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
		List<Post> posts = postService.getUserPosts(userId);
		return ResponseEntity.ok(posts);
	}

	/**
	 * Get the number of posts made by a specific user.
	 *
	 * @param userId the user's identifier
	 * @return count of posts
	 */
	@GetMapping("/1/metrics/{userId}")
	public long getUserPostCount(@PathVariable String userId) {
		return postService.getPostCountPerUser(userId);
	}

	/**
	 * Get all posts in the system.
	 *
	 * @return list of all posts
	 */
	@GetMapping("/all")
	public ResponseEntity<List<Post>> getAllPosts() {
		List<Post> posts = postService.getAllPosts();
		return ResponseEntity.ok(posts);
	}

	/**
	 * Create a new post by a user.
	 *
	 * @param username the author's username
	 * @param post     the post content
	 * @return confirmation message
	 */
	@PostMapping("/create/{username}")
	public ResponseEntity<String> createPost(@PathVariable String username , @RequestBody Post post) {
		postService.createPost(username , post);
		return ResponseEntity.ok("Post created successfully");
	}

	/**
	 * Soft-delete a post by its ID.
	 *
	 * @param postId the post's unique identifier
	 * @return confirmation message
	 */
	@DeleteMapping("/delete/{postId}")
	public ResponseEntity<String> deletePost(@PathVariable String postId) {
		postService.deletePost(postId);
		return ResponseEntity.ok("Post soft deleted successfully!");
	}
}