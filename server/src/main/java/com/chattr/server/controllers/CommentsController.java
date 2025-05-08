package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.Comments;
import com.chattr.server.services.CommentsService;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentsController {

    private final CommentsService commentsService;

    public CommentsController(CommentsService commentsService) {
        this.commentsService = commentsService;
    }

    @GetMapping("/fetch/{postId}/{commentId}")
    public Comments getCommentById(@PathVariable String postId, @PathVariable String commentId) {
        return commentsService.getCommentById(postId, commentId)
                .orElseThrow(() -> new CustomException(404, String.format(Codes.COMMENT_NOT_FOUND, commentId)));
    }

    @PostMapping("/deploy/{userId}/{postId}")
    public Comments create(@PathVariable String userId, @PathVariable String postId, @RequestBody Comments comments) {
        return commentsService.createComment(userId, postId, comments);
    }

    @DeleteMapping("/purge/{postId}/{commentId}")
    public String deleteComment(@PathVariable String postId, @PathVariable String commentId) {
        try {
            commentsService.deleteComment(postId, commentId);
            return "Comment with ID: " + commentId + " has been deleted successfully.";
        } catch (CustomException e) {
            return "Error: " + e.getMessage();
        }
    }
}