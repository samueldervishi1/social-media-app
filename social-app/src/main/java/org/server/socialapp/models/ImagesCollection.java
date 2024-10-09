package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document
public class ImagesCollection {
    @Id
    private String id;
    private String userId;
    private String postId;
    private List<String> imageUrls = new ArrayList<>();

    public ImagesCollection(String userId, String postId, List<String> imageUrls) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.postId = postId;
        this.imageUrls = imageUrls;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
