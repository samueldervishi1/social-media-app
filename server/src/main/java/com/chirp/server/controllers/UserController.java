package com.chirp.server.controllers;

import com.chirp.server.models.User;
import com.chirp.server.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hyper-api/auranet/v2.1.5/user-grid")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/neon-sync")
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(userService.getAllUsers());
	}

	@GetMapping("/node-access/{username}")
	public ResponseEntity<User> getUserInfo(@PathVariable String username) {
		return ResponseEntity.ok(userService.getUserInfo(username));
	}

	@GetMapping("/cipher-trace/{userId}")
	public ResponseEntity<User> getUserInfoById(@PathVariable String userId) {
		return ResponseEntity.ok(userService.getUserInfoById(userId));
	}
}