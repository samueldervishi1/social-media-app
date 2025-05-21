package com.chattr.server.controllers;

import com.chattr.server.models.Post;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.PostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
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
    private final ActivityLogService activityLogService;

    /**
     * Constructor-based injection for the PostService.
     *
     * @param postService service layer for post-related operations
     */
    public PostController(PostService postService, ActivityLogService activityLogService) {
        this.postService = postService;
        this.activityLogService = activityLogService;
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
        activityLogService.log(post.getUserId(), "POST_GET_BY_ID", "Retrieving post with ID: " + postId);
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
        activityLogService.log(userId, "POST_LIST_BY_USER", "Retrieving posts for user: " + userId);
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
        activityLogService.log(userId, "POST_COUNT_BY_USER", "Retrieving post count for user: " + userId);
        return postService.getPostCountPerUser(userId);
    }

    /**
     * Get all posts in the system.
     *
     * @return list of all posts
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllPostsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Post> pagedPosts = postService.getAllPostsPaged(page, size);
        activityLogService.log("anonymous", "POST_LIST_PAGED", "Paginated posts retrieved, page " + page);
        return ResponseEntity.ok(pagedPosts);
    }

    @GetMapping("/explore")
    public ResponseEntity<?> getExplorePosts(@RequestParam(defaultValue = "10") int limit) {
        List<Post> topPosts = postService.getTopPosts(limit);
        activityLogService.log("anonymous", "EXPLORE_POSTS", "Explore tab fetched, top " + limit + " posts");
        return ResponseEntity.ok(topPosts);
    }

    @GetMapping("/saved-posts/{userId}")
    public ResponseEntity<?> getSavedPosts(@PathVariable String userId) {
        List<Post> posts = postService.getSavedPosts(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}/liked/{userId}")
    public ResponseEntity<Integer> isPostLikedByUser(@PathVariable String postId, @PathVariable String userId) {
        boolean liked = postService.isPostLikedByUser(postId, userId);
        return ResponseEntity.ok(liked ? 1 : 0);
    }

    /**
     * Create a new post by a user.
     *
     * @param username the author's username
     * @param post     the post-content
     * @return confirmation message
     */
    @PostMapping("/create/{username}")
    public ResponseEntity<String> createPost(@PathVariable String username, @RequestBody Post post) {
        postService.createPost(username, post);
        activityLogService.log(username, "POST_CREATE", "Post created by user: " + username);
        return ResponseEntity.ok("Post created successfully");
    }

    @PostMapping("/save")
    public ResponseEntity<?> savePost(@RequestParam String userId, @RequestParam String postId) {
        postService.savePost(userId, postId);
        activityLogService.log(userId, "POST_SAVE", "Post saved for user ID: " + userId + ".");
        return ResponseEntity.ok("Post saved");
    }

    @PostMapping("/unsave")
    public ResponseEntity<?> unsavePost(@RequestParam String userId, @RequestParam String postId) {
        postService.unsavePost(userId, postId);
        activityLogService.log(userId, "POST_UNSAVE", "Post unsaved for user ID: " + userId + ".");
        return ResponseEntity.ok("Post unsaved");
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
        activityLogService.log(postId, "POST_DELETE", "Post with ID: " + postId + " deleted.");
        return ResponseEntity.ok("Post soft deleted successfully!");
    }
}