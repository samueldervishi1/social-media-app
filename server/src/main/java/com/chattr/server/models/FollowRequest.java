package com.chattr.server.models;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "follow_requests")
@Getter
@Setter
public class FollowRequest {

  @Id private String id;
  private String senderId;
  private String receiverId;
  private FollowStatus status;
  private LocalDateTime timestamp;

  public FollowRequest(String senderId, String receiverId, FollowStatus status) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.status = status;
    this.timestamp = LocalDateTime.now();
  }
}
