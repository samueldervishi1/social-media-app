package com.chirp.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Document(collection = "communities")
public class Community {

    @Id
    private String communityId;
    private String name;
    private String description;
    private String ownerId;

    private List<String> postIds = new ArrayList<>();
    private List<String> userIds = new ArrayList<>();

    public Community(String name, String ownerId, String description) {
        this.communityId = UUID.randomUUID().toString();
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
    }

    public String getCommunityId() {
        return communityId;
    }
    public void setCommunityId(String communityId) {
        this.communityId = communityId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getOwnerId() {
        return ownerId;
    }
    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }
    public List<String> getPostIds() {
        return postIds;
    }
    public void setPostIds(List<String> postIds) {
        this.postIds = postIds;
    }
    public List<String> getUserIds() {
        return userIds;
    }
    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}
