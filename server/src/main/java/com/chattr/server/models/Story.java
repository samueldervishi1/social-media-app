package com.chattr.server.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "stories")
public class Story {

    @Id
    private String id;
    private List<MediaItem> media = new ArrayList<>();
    Set<String> viewedBy = new HashSet<>();
    private String caption;
    private boolean isVideo;
    private String userId;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    @Getter
    @Setter
    public static class MediaItem {
        private String path;
        private boolean isVideo;
    }
}
