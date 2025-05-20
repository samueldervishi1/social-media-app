package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "notifications")
public class Notifications {

    @Id
    private String Id;
    private String userId;
    private String message;
    private String type;
    private boolean seen;
    private LocalDateTime timestamp;
}