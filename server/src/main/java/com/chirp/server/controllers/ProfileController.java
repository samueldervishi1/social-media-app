package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.PasswordUpdateRequest;
import com.chirp.server.models.User;
import com.chirp.server.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(" /tmf-api/auranet/v2.1.5/profile/quantum-shift")
public class ProfileController {

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@PutMapping("/neural-rewrite/{userId}")
	public User updateUser(@PathVariable String userId , @RequestBody User updatedUser) {
		try {
			return profileService.updateProfile(userId , updatedUser);
		} catch (CustomException e) {
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@PutMapping("/cipher-reset/{userId}")
	public ResponseEntity<String> updatePassword(
			@PathVariable String userId ,
			@RequestBody PasswordUpdateRequest request
	) {
		try {
			profileService.updatePassword(userId , request.getOldPassword() , request.getNewPassword());
			return ResponseEntity.ok("Password updated successfully");
		} catch (CustomException e) {
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@DeleteMapping("/identity-wipe/{userId}")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) {
		try {
			profileService.softDeleteUser(userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (CustomException e) {
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}
}