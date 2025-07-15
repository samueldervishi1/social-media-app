package com.chattr.server.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
public class UserInfo {
  @Getter
  @JsonProperty("username")
  private String username = null;

  @Getter
  @JsonProperty("userId")
  private String userId = null;

  @JsonProperty("status")
  private String status = null;

  @Getter
  @JsonProperty("message")
  private String message = null;
}
