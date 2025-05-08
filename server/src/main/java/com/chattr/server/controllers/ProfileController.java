package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.PasswordUpdateRequest;
import com.chattr.server.models.User;
import com.chattr.server.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PutMapping("/profiles/{userId}/update")
    public User updateUser(@PathVariable String userId, @RequestBody User updatedUser) {
        try {
            return profileService.updateProfile(userId, updatedUser);
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }

    @PutMapping("/profiles/{userId}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable String userId,
            @RequestBody PasswordUpdateRequest request
    ) {
        try {
            profileService.updatePassword(userId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password updated successfully");
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }

    @DeleteMapping("/profiles/{userId}/delete")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        try {
            profileService.softDeleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }

    @PutMapping("/profiles/{userId}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable String userId) {
        try {
            profileService.deactivateUser(userId);
            return ResponseEntity.ok("User deactivated successfully");
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }

    @PutMapping("/profiles/{userId}/reactivate")
    public ResponseEntity<String> reactivateUser(@PathVariable String userId) {
        try {
            profileService.activateUser(userId);
            return ResponseEntity.ok("User reactivated successfully");
        } catch (CustomException e) {
            throw new CustomException(e.getCode(), e.getMessage());
        }
    }
}