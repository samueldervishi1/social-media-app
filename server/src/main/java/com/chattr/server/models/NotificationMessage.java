package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationMessage {
  private String toUserId;
  private String message;
  private String type;
}
