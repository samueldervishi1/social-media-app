package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Document("communityPost")
public class CommunityPost {

    @Id
    private String id;
    private String ownerId;
    private String communityName;
    private String content;
    private LocalDateTime createTime;
    private List<Comments> comments = new ArrayList<>();
    private boolean deleted;

    public CommunityPost() {
    }

    public CommunityPost(String ownerId, String communityName, String content, LocalDateTime createTime) {
        this.ownerId = ownerId;
        this.communityName = communityName;
        this.content = content;
        this.createTime = createTime;
        this.comments = new ArrayList<>();
        this.deleted = false;
    }
}