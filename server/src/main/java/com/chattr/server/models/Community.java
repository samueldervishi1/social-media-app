package com.chattr.server.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "communities")
public class Community {

  @Id private String id;
  private String name;
  private String description;
  private String ownerId;
  private LocalDateTime createTime;

  private List<String> postIds = new ArrayList<>();
  private List<String> userIds = new ArrayList<>();
  private List<Faq> faqs = new ArrayList<>();

  public Community(String name, String ownerId, String description) {
    this.id = UUID.randomUUID().toString();
    this.ownerId = ownerId;
    this.name = name;
    this.description = description;
    this.createTime = LocalDateTime.now();
  }

  public Community() {}
}
