package com.chattr.server.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Setter
@Getter
@Document
public class User {

    @Id
    private String id;
    private String username;
    private String password;
    private String salt;
    private String fullName;
    private String email;
    private String bio;
    private String title;
    private String role = "simple_account";
    private boolean deleted;
    private boolean twoFa = false;
    private LocalDateTime accountCreationDate;
    private List<String> reportedPostIds;
    private boolean isDeactivated;
    private LocalDateTime deactivationTime;
    private String ipAddress;
	private String lastLoginIp;
	private LocalDateTime lastLoginTime;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}