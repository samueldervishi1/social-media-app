package com.server.server.controllers;

import com.server.server.exceptions.CustomException;
import com.server.server.models.PasswordUpdateRequest;
import com.server.server.models.User;
import com.server.server.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProfileController {

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@PutMapping("/profiles/{userId}/update")
	public User updateUser(@PathVariable String userId , @RequestBody User updatedUser) {
		try {
			return profileService.updateProfile(userId , updatedUser);
		} catch (CustomException e) {
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@PutMapping("/profiles/{userId}/password")
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

	@DeleteMapping("/profiles/{userId}/delete")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) {
		try {
			profileService.softDeleteUser(userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (CustomException e) {
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}
}