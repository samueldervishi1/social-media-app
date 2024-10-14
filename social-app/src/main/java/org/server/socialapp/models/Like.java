package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document
public class Like {
    @Id
    private String id;
    private String userId;
    private List<String> postId = new ArrayList<>();
    private List<String> commentId = new ArrayList<>();

    public Like() {
    }

    public Like(String userId) {
        this.userId = userId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getPostId() {
        return postId;
    }

    public void setPostId(List<String> postId) {
        this.postId = postId;
    }

    public List<String> getCommentId() {
        return commentId;
    }

    public void setCommentId(List<String> commentId) {
        this.commentId = commentId;
    }
}
