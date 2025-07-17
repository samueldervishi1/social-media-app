package com.chattr.server.models;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "notifications")
public class Notifications {

    @Id
    private String id;
    private String userId;
    private String message;
    private String type;
    private boolean seen;
    private LocalDateTime timestamp;
}
