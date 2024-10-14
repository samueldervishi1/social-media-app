package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "userVideos")
public class UserVideoActions {

    @Id
    private String id;
    private String userId;
    private List<Video> savedVideos;
    private List<Video> likedVideos;

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

    public List<Video> getSavedVideos() {
        return savedVideos;
    }

    public void setSavedVideos(List<Video> savedVideos) {
        this.savedVideos = savedVideos;
    }

    public List<Video> getLikedVideos() {
        return likedVideos;
    }

    public void setLikedVideos(List<Video> likedVideos) {
        this.likedVideos = likedVideos;
    }
}
