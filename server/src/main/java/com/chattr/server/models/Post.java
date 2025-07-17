package com.chattr.server.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document
public class Post {

    @Id
    private String id;
    private String userId;
    private String content;
    private List<Comment> commentList = new ArrayList<>();
    private List<String> likedUserIds = new ArrayList<>();
    private List<String> savedUserIds = new ArrayList<>();
    private String postDate;
    private String postTime;
    private Boolean deleted = false;
    private Boolean reported = false;

    public Post(String content) {
        this.id = UUID.randomUUID().toString();
        this.content = content;
        this.postDate = LocalDate.now().toString();
        this.postTime = LocalTime.now().toString();
    }

    public boolean isReported() {
        return reported;
    }
}
