package org.server.socialapp.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Document(collection = "userActions")
public class ActivityModel {

    @Id
    private String id;
    private ActionType actionType;
    private String userId;
    private Instant timestamp;
    private String status;

    public ActivityModel(ActionType actionType, String userId, Instant timestamp, String status) {
        this.id = UUID.randomUUID().toString();
        this.actionType = actionType;
        this.userId = userId;
        this.timestamp = timestamp;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static class ActionType {
        private List<String> allActivity;

        public ActionType(List<String> allActivity) {
            this.allActivity = allActivity;
        }

        public List<String> getAllActivity() {
            return allActivity;
        }

        public void setAllActivity(List<String> allActivity) {
            this.allActivity = allActivity;
        }
    }
}
