package com.chattr.server.models;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserNetworkResponse {

  private UserLiteDTO user;
  private List<UserLiteDTO> followers;
  private List<UserLiteDTO> following;
}
