package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.PasswordUpdateRequest;
import com.chattr.server.models.User;
import com.chattr.server.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing user profiles, including updates, password changes, deletion, and activation.
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {

	private final ProfileService profileService;

	/**
	 * Constructor-based injection for ProfileService.
	 *
	 * @param profileService service layer handling user profile logic
	 */
	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	/**
	 * Update a user's profile.
	 *
	 * @param userId      the ID of the user to update
	 * @param updatedUser updated user data
	 * @return updated user object
	 */
	@PutMapping("/{userId}/update")
	public ResponseEntity<User> updateUser(@PathVariable String userId , @RequestBody User updatedUser) {
		try {
			User updated = profileService.updateProfile(userId , updatedUser);
			return ResponseEntity.ok(updated);
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).build();
		}
	}

	/**
	 * Update the password for a user.
	 *
	 * @param userId  the ID of the user
	 * @param request object containing old and new passwords
	 * @return success or error message
	 */
	@PutMapping("/{userId}/update/password")
	public ResponseEntity<String> updatePassword(
			@PathVariable String userId ,
			@RequestBody PasswordUpdateRequest request
	) {
		try {
			profileService.updatePassword(userId , request.getOldPassword() , request.getNewPassword());
			return ResponseEntity.ok("Password updated successfully");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(e.getMessage());
		}
	}

	/**
	 * Soft delete (deactivate) a user account.
	 *
	 * @param userId the ID of the user to delete
	 * @return success or error message
	 */
	@DeleteMapping("/{userId}/delete")
	public ResponseEntity<String> deleteUser(@PathVariable String userId) {
		try {
			profileService.softDeleteUser(userId);
			return ResponseEntity.ok("User deleted successfully");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(e.getMessage());
		}
	}

	/**
	 * Deactivate a user account.
	 *
	 * @param userId the ID of the user to deactivate
	 * @return success or error message
	 */
	@PutMapping("/{userId}/deactivate")
	public ResponseEntity<String> deactivateUser(@PathVariable String userId) {
		try {
			profileService.deactivateUser(userId);
			return ResponseEntity.ok("User deactivated successfully");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(e.getMessage());
		}
	}

	/**
	 * Reactivate a previously deactivated user account.
	 *
	 * @param userId the ID of the user to reactivate
	 * @return success or error message
	 */
	@PutMapping("/{userId}/reactivate")
	public ResponseEntity<String> reactivateUser(@PathVariable String userId) {
		try {
			profileService.activateUser(userId);
			return ResponseEntity.ok("User reactivated successfully");
		} catch (CustomException e) {
			return ResponseEntity.status(e.getCode()).body(e.getMessage());
		}
	}
}