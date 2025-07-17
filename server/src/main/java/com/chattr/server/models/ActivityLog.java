package com.chattr.server.models;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "activity_logs")
public class ActivityLog {

    @Id
    private String id;

    private String username;
    private String action;
    private String details;
    private LocalDateTime timestamp;

    public ActivityLog() {
    }

    public ActivityLog(String username, String action, String details) {
        this.username = username;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
