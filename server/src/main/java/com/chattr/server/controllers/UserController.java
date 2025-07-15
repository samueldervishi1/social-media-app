package com.chattr.server.controllers;

import com.chattr.server.models.User;
import com.chattr.server.models.UserLiteDTO;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.UserService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for managing user-related data. */
@RestController
@RequestMapping("/users")
public class UserController {

  private final UserService userService;
  private final ActivityLogService activityLogService;

  public UserController(UserService userService, ActivityLogService activityLogService) {
    this.userService = userService;
    this.activityLogService = activityLogService;
  }

  @GetMapping
  public ResponseEntity<List<User>> getAllUsers() {
    activityLogService.log("anonymous", "USER_GET_ALL", "Fetching all users");
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @GetMapping("/lookup/{username}")
  public ResponseEntity<User> getUserInfo(@PathVariable String username) {
    activityLogService.log(
        username, "USER_GET_BY_USERNAME", "Fetching user info for username: " + username + " ...");
    return ResponseEntity.ok(userService.getUserInfo(username));
  }

  @GetMapping("/{userId}/username")
  public ResponseEntity<String> getUsername(@PathVariable String userId) {
    String username = userService.getUsernameById(userId);
    activityLogService.log(username, "USER_GET_BY_ID", "Fetching username for user ID: " + userId);
    return ResponseEntity.ok(username);
  }

  @GetMapping("/{userId}/followers")
  public ResponseEntity<List<UserLiteDTO>> getFollowers(@PathVariable String userId) {
    return ResponseEntity.ok(userService.getFollowers(userId));
  }

  @GetMapping("/{userId}/following")
  public ResponseEntity<List<UserLiteDTO>> getFollowing(@PathVariable String userId) {
    return ResponseEntity.ok(userService.getFollowing(userId));
  }
}
