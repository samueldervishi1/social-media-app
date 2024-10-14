package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document
public class FollowerDTO {

    @Id
    private String id;
    private String userId;
    private List<String> followerId;
    private List<String> followingId;

    public FollowerDTO() {
        this.followerId = new ArrayList<>();
        this.followingId = new ArrayList<>();
    }

    public FollowerDTO(String userId) {
        this.userId = userId;
        this.followerId = new ArrayList<>();
        this.followingId = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getFollowerId() {
        return followerId;
    }

    public void setFollowerId(List<String> followerId) {
        this.followerId = followerId;
    }

    public List<String> getFollowingId() {
        return followingId;
    }

    public void setFollowingId(List<String> followingId) {
        this.followingId = followingId;
    }
}
