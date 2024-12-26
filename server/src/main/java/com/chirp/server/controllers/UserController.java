package com.chirp.server.controllers;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.services.UpdatePassword;
import com.chirp.server.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/users")
public class UserController {

	private final UserService userService;
	private final UpdatePassword updatePassword;

	public UserController(UserService userService , UpdatePassword updatePassword) {
		this.userService = userService;
		this.updatePassword = updatePassword;
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
	public ResponseEntity<User> register(@RequestBody User user) {
		User createdUser = userService.createUser(user);
		return ResponseEntity.status(HttpStatus.OK).body(createdUser);
	}

	@PutMapping("/update-password")
	public ResponseEntity<String> updatePassword(@RequestParam String username , @RequestParam String newPassword) {
		try {
			updatePassword.updatePassword(username , newPassword);
			return ResponseEntity.ok("Password updated successfully!");
		} catch (NotFoundException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with username: " + username);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating password");
		}
	}
}