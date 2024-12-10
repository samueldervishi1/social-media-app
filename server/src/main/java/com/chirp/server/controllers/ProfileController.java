package com.chirp.server.controllers;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
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
		} catch (IllegalArgumentException e) {
			logger.error("Invalid input data for updating user: {}" , updatedUser , e);
			throw new BadRequestException("Invalid data provided for user update.");
		} catch (Exception e) {
			logger.error("Error updating user: {}" , updatedUser , e);
			throw new InternalServerErrorException("An unexpected error occurred while updating the user.");
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
		} catch (IllegalArgumentException e) {
			logger.error("Invalid password data for user: {}" , userId , e);
			throw new BadRequestException("Invalid password update request.");
		} catch (Exception e) {
			logger.error("Error updating password for user: {}" , userId , e);
			throw new InternalServerErrorException("An unexpected error occurred while updating the password.");
		}
	}

	@DeleteMapping("/delete/{userId}")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) {
		try {
			profileService.softDeleteUser(userId);
			logger.info("User deleted successfully: {}" , userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (NotFoundException e) {
			logger.error("User not found: {}" , userId , e);
			throw new NotFoundException("User not found to delete.");
		} catch (Exception e) {
			logger.error("Error deleting user: {}" , userId , e);
			throw new InternalServerErrorException("An unexpected error occurred while deleting the user.");
		}
	}
}