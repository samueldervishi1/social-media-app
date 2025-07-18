package com.chattr.server.controllers;

import com.chattr.server.models.PasswordUpdateRequest;
import com.chattr.server.models.User;
import com.chattr.server.services.ProfileService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing user profiles, including updates, password
 * changes, deletion, and activation.
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/is-blocked")
    public ResponseEntity<?> isBlocked(@RequestParam String blockerId, @RequestParam String targetId) {
        boolean isBlocked = profileService.isBlocked(blockerId, targetId);
        return ResponseEntity.ok(Map.of("isBlocked", isBlocked));
    }

    @PostMapping("/change/account/public")
    public ResponseEntity<?> changeAccountPublic(@RequestParam String userId) {
        User user = profileService.makePublic(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/change/account/private")
    public ResponseEntity<?> changeAccountPrivate(@RequestParam String userId) {
        User user = profileService.makePrivate(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/block")
    public ResponseEntity<?> blockUser(@RequestBody Map<String, String> body) {
        String blockerId = body.get("blockerId");
        String targetId = body.get("targetId");
        profileService.blockUser(blockerId, targetId);
        return ResponseEntity.ok("User blocked successfully");
    }

    @PostMapping("/unblock")
    public ResponseEntity<?> unblockUser(@RequestBody Map<String, String> body) {
        String blockerId = body.get("blockerId");
        String targetId = body.get("targetId");
        profileService.unblockUser(blockerId, targetId);
        return ResponseEntity.ok("User unblocked successfully");
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User updatedUser) {
        User updated = profileService.updateProfile(userId, updatedUser);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{userId}/update/password")
    public ResponseEntity<String> updatePassword(@PathVariable String userId,
            @RequestBody PasswordUpdateRequest request) {
        profileService.updatePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("/{userId}/delete")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        profileService.softDeleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable String userId) {
        profileService.deactivateUser(userId);
        return ResponseEntity.ok("User deactivated successfully");
    }

    @PutMapping("/{userId}/reactivate")
    public ResponseEntity<String> reactivateUser(@PathVariable String userId) {
        profileService.activateUser(userId);
        return ResponseEntity.ok("User reactivated successfully");
    }
}
