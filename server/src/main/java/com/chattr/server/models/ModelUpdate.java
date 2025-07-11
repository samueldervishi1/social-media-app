package com.chattr.server.models;

import lombok.Data;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Data
public class ModelUpdate {

    @Id
    private String id;

    private LocalDateTime dateTime;
    private String changes;
    private String version;
    private String status;
    private String modelName;

    public ModelUpdate() {
        this.dateTime = LocalDateTime.now();
    }
}