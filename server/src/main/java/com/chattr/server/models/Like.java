package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "post_likes")
public class Like {

    @Id
    private String userId;
    private List<String> postIds = new ArrayList<>();
    private String likedBy;
    private LocalDateTime timestamp;

    public Like(String userId, String postId) {
        this.userId = userId;
        this.likedBy = userId;
        this.postIds.add(postId);
        this.timestamp = LocalDateTime.now();
    }
}