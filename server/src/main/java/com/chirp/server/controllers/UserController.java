package com.chirp.server.controllers;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.services.UpdatePassword;
import com.chirp.server.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/users")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private UpdatePassword updatePassword;

	@PostMapping("/auth/register")
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