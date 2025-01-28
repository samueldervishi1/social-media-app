package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.PasswordUpdateRequest;
import com.chirp.server.models.User;
import com.chirp.server.services.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/users/update")
public class ProfileController {

	private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@PutMapping("/{userId}")
	public User updateUser(@PathVariable String userId , @RequestBody User updatedUser) {
		try {
			User updated = profileService.updateProfile(userId , updatedUser);
			logger.info("User updated successfully: {}" , updatedUser);
			return updated;
		} catch (CustomException e) {
			logger.error("Error updating user: {}" , updatedUser , e);
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@PutMapping("/update-password/{userId}")
	public ResponseEntity<String> updatePassword(
			@PathVariable String userId ,
			@RequestBody PasswordUpdateRequest request
	) {
		try {
			profileService.updatePassword(userId , request.getOldPassword() , request.getNewPassword());
			logger.info("Password updated successfully for user: {}" , userId);
			return ResponseEntity.ok("Password updated successfully");
		} catch (CustomException e) {
			logger.error("Error updating password for user: {}" , userId , e);
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}

	@DeleteMapping("/delete/{userId}")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) {
		try {
			profileService.softDeleteUser(userId);
			logger.info("User deleted successfully: {}" , userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (CustomException e) {
			logger.error("Error deleting user: {}" , userId , e);
			throw new CustomException(e.getCode() , e.getMessage());
		}
	}
}