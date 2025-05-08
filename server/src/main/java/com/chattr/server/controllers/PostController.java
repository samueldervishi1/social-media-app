package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Post;
import com.chattr.server.services.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts/get/1/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable String postId) {
        try {
            Post post = postService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getCode()).body(null);
        }
    }

    @GetMapping("/posts/user-feed/{userId}")
    public ResponseEntity<List<Post>> listUserPosts(@PathVariable String userId) {
        try {
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getCode()).body(null);
        }
    }

    @GetMapping("/posts/stream-metrics/{userId}")
    public long getUserPostCount(@PathVariable String userId) {
        try {
            return postService.getPostCountPerUser(userId);
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        try {
            List<Post> posts = postService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getCode()).body(null);
        }
    }

    @PostMapping("/posts/build/{username}")
    public ResponseEntity<String> create(@PathVariable String username, @RequestBody Post post) {
        try {
            postService.createPost(username, post);
            return ResponseEntity.ok("Post created successfully");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getCode()).body("Error creating post");
        }
    }

    @DeleteMapping("/posts/erase/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable String postId) {
        try {
            postService.deletePost(postId);
            return ResponseEntity.ok("Post soft deleted successfully!");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getCode()).body("Error deleting post");
        }
    }
}