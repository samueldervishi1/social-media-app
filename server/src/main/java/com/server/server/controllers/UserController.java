package com.server.server.controllers;

import com.server.server.models.User;
import com.server.server.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/users")
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(userService.getAllUsers());
	}

	@GetMapping("/get/{username}")
	public ResponseEntity<User> getUserInfo(@PathVariable String username) {
		return ResponseEntity.ok(userService.getUserInfo(username));
	}

	@GetMapping("/retrieve/{userId}")
	public ResponseEntity<User> getUserInfoById(@PathVariable String userId) {
		return ResponseEntity.ok(userService.getUserInfoById(userId));
	}
}