package com.chattr.server.controllers;

import com.chattr.server.models.User;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing user-related data.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final ActivityLogService activityLogService;

    /**
     * Constructor for injecting UserService.
     */
    public UserController(UserService userService, ActivityLogService activityLogService) {
        this.userService = userService;
        this.activityLogService = activityLogService;
    }

    /**
     * Fetch all registered users.
     *
     * @return list of users
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        activityLogService.log("anonymous", "USER_GET_ALL", "Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Fetch user details by username.
     *
     * @param username the unique username
     * @return the user object
     */
    @GetMapping("/lookup/{username}")
    public ResponseEntity<User> getUserInfo(@PathVariable String username) {
        activityLogService.log(username, "USER_GET_BY_USERNAME", "Fetching user info for username: " + username + " ...");
        return ResponseEntity.ok(userService.getUserInfo(username));
    }

    /**
     * Retrieve a username based on user ID.
     *
     * @param userId the unique user ID
     * @return the associated username
     */
    @GetMapping("/lookup/find")
    public ResponseEntity<String> getUsername(@RequestParam String userId) {
        String username = userService.getUsernameById(userId);
        activityLogService.log(username, "USER_GET_BY_ID", "Fetching username for user ID: " + userId);
        return ResponseEntity.ok(username);
    }
}