package com.chirp.server.controllers;

import com.chirp.server.models.Error;
import com.chirp.server.models.User;
import com.chirp.server.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public ResponseEntity<List<User>> getAllUsers() {
		List<User> users = userService.getAllUsers();
		return ResponseEntity.ok(users);
	}

	@GetMapping("/info/{username}")
	public ResponseEntity<User> getUserInfo(@PathVariable String username) {
		User user = userService.getUserInfo(username);
		return ResponseEntity.ok(user);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<User> getUserInfoById(@PathVariable String userId) {
		User user = userService.getUserInfoById(userId);
		return ResponseEntity.ok(user);
	}

	@PostMapping("/auth/register")
	public ResponseEntity<Error> register(@RequestBody User user) {
		User createdUser = userService.createUser(user);
		Error response = new Error();
		response.setCode("200");
		response.setMessage("User registered successfully");
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}
}