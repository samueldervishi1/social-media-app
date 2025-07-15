package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLiteDTO {

  private String id;
  private String username;
  private String fullName;

  public UserLiteDTO(String id, String username, String fullName) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
  }
}
