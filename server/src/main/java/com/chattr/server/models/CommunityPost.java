package com.chattr.server.models;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document("communityPost")
public class CommunityPost {

  @Id private String id;
  private String ownerId;
  private String communityName;
  private String content;
  private LocalDateTime createTime;
  private List<Comment> comments;
  private boolean deleted;
}
