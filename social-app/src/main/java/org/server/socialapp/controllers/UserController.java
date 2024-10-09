package org.server.socialapp.controllers;

import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.User;
import org.server.socialapp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        System.out.println("User registering: " + user.getUsername());
        return userService.createUser(user);
    }

    @GetMapping("/info/{username}")
    public User getUserInfo(@PathVariable String username) {
        return userService.getUserInfo(username);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserInfoById(@PathVariable String userId) {
        try {
            User user = userService.getUserInfoById(userId);
            return ResponseEntity.ok(user);
        } catch (NotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
