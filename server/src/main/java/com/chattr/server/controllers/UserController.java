package com.chattr.server.controllers;

import com.chattr.server.models.User;
import com.chattr.server.models.UserLiteDTO;
import com.chattr.server.services.UserService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for managing user-related data. */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/lookup/{username}")
    public ResponseEntity<User> getUserInfo(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserInfo(username));
    }

    @GetMapping("/{userId}/username")
    public ResponseEntity<String> getUsername(@PathVariable String userId) {
        String username = userService.getUsernameById(userId);
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
