package com.chattr.server.models;

import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class ModelUpdate {

    @Id
    private String id;

    private LocalDateTime dateTime;
    private String changes;
    private String version;
    private String status;
    private String modelName;
    private String modelId;

    public ModelUpdate() {
        this.dateTime = LocalDateTime.now();
    }
}
