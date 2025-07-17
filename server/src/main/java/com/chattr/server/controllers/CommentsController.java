package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Comment;
import com.chattr.server.models.Messages;
import com.chattr.server.services.ActivityLogService;
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
    private final ActivityLogService activityLogService;

    public CommentsController(CommentsService commentsService, ActivityLogService activityLogService) {
        this.commentsService = commentsService;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/get/{postId}/{commentId}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String postId, @PathVariable String commentId) {
        Comment comment = commentsService.getCommentById(postId, commentId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.COMMENT_NOT_FOUND, commentId)));
        activityLogService.log(comment.getUserId(), "COMMENT_VIEW",
                "User used method comment by ID" + comment.getContent());
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/create/{userId}/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable String userId, @PathVariable String postId,
            @RequestBody Comment comment) {
        Comment created = commentsService.createComment(userId, postId, comment);
        activityLogService.log(userId, "COMMENT_CREATE",
                "User created comment with ID: " + created.getId() + " for post with ID: " + postId + ".");
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/delete/{postId}/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        commentsService.deleteComment(postId, commentId);
        activityLogService.log(commentId, "COMMENT_DELETE",
                "Comment with ID: " + commentId + " deleted from post with ID: " + postId + ".");
        return ResponseEntity.ok().build();
    }
}
