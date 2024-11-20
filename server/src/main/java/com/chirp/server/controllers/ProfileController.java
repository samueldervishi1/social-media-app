package com.chirp.server.controllers;

import com.chirp.server.models.PasswordUpdateRequest;
import com.chirp.server.models.User;
import com.chirp.server.services.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/users/update")
public class ProfileController {

	@Autowired
	private ProfileService profileService;

	@PutMapping("/{userId}")
	public User updateUser(@PathVariable String userId , @RequestBody User updatedUser) throws Exception {
		System.out.println("User updating the data: " + updatedUser);
		return profileService.updateProfile(userId , updatedUser);
	}

	@PutMapping("/update-password/{userId}")
	public ResponseEntity<String> updatePassword(
			@PathVariable String userId ,
			@RequestBody PasswordUpdateRequest request
	) throws Exception {
		profileService.updatePassword(userId , request.getOldPassword() , request.getNewPassword());
		return ResponseEntity.ok("Password updated successfully");
	}

	@DeleteMapping("/delete/{userId}")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) throws Exception {
		try {
			profileService.softDeleteUser(userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error soft deleting the user: " + e.getMessage());
		}
	}
}
