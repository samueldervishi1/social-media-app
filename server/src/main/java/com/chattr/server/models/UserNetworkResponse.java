package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserNetworkResponse {

    private UserLiteDTO user;
    private List<UserLiteDTO> followers;
    private List<UserLiteDTO> following;
}