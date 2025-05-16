package com.chattr.server.controllers;

import com.chattr.server.models.User;
import com.chattr.server.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing user-related data.
 */
@RestController
@RequestMapping("/users")
public class UserController {

	private final UserService userService;

	/**
	 * Constructor for injecting UserService.
	 */
	public UserController(UserService userService) {
		this.userService = userService;
	}

	/**
	 * Fetch all registered users.
	 *
	 * @return list of users
	 */
	@GetMapping
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(userService.getAllUsers());
	}

	/**
	 * Fetch user details by username.
	 *
	 * @param username the unique username
	 * @return the user object
	 */
	@GetMapping("/{username}")
	public ResponseEntity<User> getUserInfo(@PathVariable String username) {
		return ResponseEntity.ok(userService.getUserInfo(username));
	}

	/**
	 * Retrieve a username based on user ID.
	 *
	 * @param userId the unique user ID
	 * @return the associated username
	 */
	@GetMapping("/lookup/username")
	public ResponseEntity<String> getUsername(@RequestParam String userId) {
		String username = userService.getUsernameById(userId);
		return ResponseEntity.ok(username);
	}
}