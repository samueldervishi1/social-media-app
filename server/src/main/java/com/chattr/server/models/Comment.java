package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Setter
@Getter
@Document
public class Comment {

    @Id
    private String id;
    private String userId;
    private String content;
    private String commentDate;
    private String commentTime;

    public Comment(String userId, String content) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.content = content;
        this.commentDate = LocalDate.now().toString();
        this.commentTime = LocalTime.now().toString();
    }
}