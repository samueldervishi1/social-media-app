package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@Document(value = "reports")
public class Report {

    @Id
    private String id;
    private String userId;
    private String postId;
    private String reason;
    private LocalDateTime reportTime;

    public Report(String id) {
        this.id = id;
        this.id = UUID.randomUUID().toString();
    }
}