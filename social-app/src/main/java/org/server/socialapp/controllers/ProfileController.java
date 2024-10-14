package org.server.socialapp.controllers;

import org.server.socialapp.models.PasswordUpdateRequest;
import org.server.socialapp.models.User;
import org.server.socialapp.services.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/users/update")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PutMapping("/{userId}")
    public User updateUser(@PathVariable String userId, @RequestBody User updatedUser) {
        System.out.println("User updating the data: " + updatedUser);
        return profileService.updateProfile(userId, updatedUser);
    }

    @PutMapping("/update-password/{userId}")
    public ResponseEntity<String> updatePassword(
            @PathVariable String userId,
            @RequestBody PasswordUpdateRequest request
    ) {
        profileService.updatePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully");
    }

}
