package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Comment;
import com.chattr.server.models.Messages;
import com.chattr.server.services.CommentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing comments on posts.
 */
@RestController
@RequestMapping("/comments")
public class CommentsController {

    private final CommentsService commentsService;

    public CommentsController(CommentsService commentsService) {
        this.commentsService = commentsService;
    }

    @GetMapping("/get/{postId}/{commentId}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String postId, @PathVariable String commentId) {
        Comment comment = commentsService.getCommentById(postId, commentId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.COMMENT_NOT_FOUND, commentId)));
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/create/{userId}/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable String userId, @PathVariable String postId,
            @RequestBody Comment comment) {
        Comment created = commentsService.createComment(userId, postId, comment);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/delete/{postId}/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        commentsService.deleteComment(postId, commentId);
        return ResponseEntity.ok().build();
    }
}
