package org.server.socialapp.controllers;

import org.server.socialapp.models.Like;
import org.server.socialapp.services.LikesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/likes")
public class LikesController {

    @Autowired
    private LikesService likesService;

    @PostMapping("/post/{userId}/{postId}")
    public Like likePost(@PathVariable String userId, @PathVariable String postId) {
        return likesService.likePost(userId, postId);
    }

    @PostMapping("/comment/{userId}/{commentId}")
    public Like likeComment(@PathVariable String userId, @PathVariable String commentId) {
        return likesService.likeComment(userId, commentId);
    }

    @GetMapping("/post/{postId}")
    public int getLikesCountForPost(@PathVariable String postId) {
        return likesService.getLikesCountForPost(postId);
    }

    @GetMapping("/comment/{commentId}")
    public List<Like> getLikesForComment(@PathVariable String commentId) {
        return likesService.getLikesForComment(commentId);
    }

    @GetMapping("/{userId}")
    public List<Like> getLikesForUser(@PathVariable String userId) {
        return likesService.getLikesForUser(userId);
    }
}
