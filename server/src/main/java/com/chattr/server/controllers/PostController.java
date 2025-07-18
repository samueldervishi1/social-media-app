package com.chattr.server.controllers;

import com.chattr.server.models.Post;
import com.chattr.server.services.PostService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing posts: creation, retrieval, deletion, and
 * user-specific queries.
 */
@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable String postId) {
        Post post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
        List<Post> posts = postService.getUserPosts(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/users/{userId}/count")
    public long getUserPostCount(@PathVariable String userId) {
        return postService.getPostCountPerUser(userId);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllPostsPaged(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Post> pagedPosts = postService.getAllPostsPaged(page, size);

        // Create a stable response structure
        Map<String, Object> response = new HashMap<>();
        response.put("content", pagedPosts.getContent());
        response.put("totalElements", pagedPosts.getTotalElements());
        response.put("totalPages", pagedPosts.getTotalPages());
        response.put("currentPage", pagedPosts.getNumber());
        response.put("pageSize", pagedPosts.getSize());
        response.put("first", pagedPosts.isFirst());
        response.put("last", pagedPosts.isLast());
        response.put("hasNext", pagedPosts.hasNext());
        response.put("hasPrevious", pagedPosts.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/comments/count")
    public ResponseEntity<Integer> getCommentCount(@PathVariable String postId) {
        int count = postService.getCommentCountForPost(postId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/explore")
    public ResponseEntity<?> getExplorePosts(@RequestParam(defaultValue = "10") int limit) {
        List<Post> topPosts = postService.getTopPosts(limit);
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

    @PostMapping("/users/{username}")
    public ResponseEntity<String> createPost(@PathVariable String username, @RequestBody Post post) {
        postService.createPost(username, post);
        return ResponseEntity.ok("Post created successfully");
    }

    @PostMapping("/{postId}/save/{userId}")
    public ResponseEntity<?> savePost(@PathVariable String userId, @PathVariable String postId) {
        postService.savePost(userId, postId);
        return ResponseEntity.ok("Post saved");
    }

    @PostMapping("/{postId}/unsave/{userId}")
    public ResponseEntity<?> unsavePost(@PathVariable String postId, @PathVariable String userId) {
        postService.unsavePost(userId, postId);
        return ResponseEntity.ok("Post unsaved");
    }

    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok("Post soft deleted successfully!");
    }
}
