package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

import static com.chattr.server.models.Messages.USER_NOT_FOUND_BY_ID;

/**
 * Service responsible for user profile updates, password management,
 * and account state toggling (activate/deactivate/softly delete).
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoggingService loggingService;

    public User updateProfile(String userId, User updatedUser) {
        validateUserId(userId);
        User user = findUserById(userId);

        applyProfileChanges(user, updatedUser);

        return userRepository.save(user);
    }

    public void updatePassword(String userId, String oldPassword, String newPassword) {
        validateUserId(userId);
        User user = findUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            loggingService.logWarn("ProfileService", "updatePassword",
                    "Password update failed for userId " + userId + ": incorrect old password");
            throw new CustomException(400, String.format(Messages.INVALID_CREDENTIALS));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void softDeleteUser(String userId) {
        toggleUserFlag(userId, true, false, null);
        loggingService.logInfo("ProfileService", "softDeleteUser",
                "User soft-deleted: userId " + userId);
    }

    public void deactivateUser(String userId) {
        toggleUserFlag(userId, false, true, LocalDateTime.now());
        loggingService.logInfo("ProfileService", "deactivateUser",
                "User deactivated: userId " + userId);
    }

    public void activateUser(String userId) {
        toggleUserFlag(userId, false, false, null);
        loggingService.logInfo("ProfileService", "activateUser",
                "User reactivated: userId " + userId);
    }

    public void blockUser(String blockerId, String targetId) {
        if (blockerId.equals(targetId)) {
            throw new CustomException(400, String.format(Messages.BLOCK_NOT_ALLOWED));
        }

        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, blockerId)));

        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, targetId)));

        // Ensure blockedUsers list exists
        if (blocker.getBlockedUsers() == null) {
            blocker.setBlockedUsers(new ArrayList<>());
        }

        // Only add if not already blocked
        if (!blocker.getBlockedUsers().contains(targetId)) {
            blocker.getBlockedUsers().add(targetId);
        }

        // Remove each other from followers/following
        if (blocker.getFollowing() != null) {
            blocker.getFollowing().remove(targetId);
        }

        if (blocker.getFollowers() != null) {
            blocker.getFollowers().remove(targetId);
        }

        if (target.getFollowing() != null) {
            target.getFollowing().remove(blockerId);
        }

        if (target.getFollowers() != null) {
            target.getFollowers().remove(blockerId);
        }

        userRepository.save(blocker);
        userRepository.save(target);
    }


    public void unblockUser(String blockerId, String targetId) {
        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, blockerId)));

        if (blocker.getBlockedUsers() != null && blocker.getBlockedUsers().contains(targetId)) {
            blocker.getBlockedUsers().remove(targetId);
            userRepository.save(blocker);
        }
    }

    public boolean isBlocked(String blockerId, String targetId) {
        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, blockerId)));
        return blocker.getBlockedUsers() != null && blocker.getBlockedUsers().contains(targetId);
    }

    public User makePublic(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND_BY_ID, userId)));

        user.setPrivate(false);
        return userRepository.save(user);
    }

    public User makePrivate(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(USER_NOT_FOUND_BY_ID, userId)));

        user.setPrivate(true);
        return userRepository.save(user);
    }

    private void applyProfileChanges(User user, User updatedUser) {
        Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
        Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
        Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
        Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
        Optional.ofNullable(updatedUser.getProfileColorHex()).ifPresent(user::setProfileColorHex);
        if (updatedUser.getLinks() != null) {
            List<String> newLinks = updatedUser.getLinks();
            List<String> mergedLinks = new ArrayList<>(newLinks);

            Set<String> uniqueLinks = new LinkedHashSet<>(mergedLinks);

            user.setLinks(new ArrayList<>(uniqueLinks));
        }
        user.setTwoFa(updatedUser.isTwoFa());
    }

    private void toggleUserFlag(String userId, boolean deleted, boolean deactivated, LocalDateTime deactivationTime) {
        validateUserId(userId);
        User user = findUserById(userId);

        user.setDeleted(deleted);
        user.setDeactivated(deactivated);
        user.setDeactivationTime(deactivationTime);

        userRepository.save(user);
    }

    private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND_BY_ID, userId)));
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(Messages.USER_ID_ERROR);
        }
    }
}