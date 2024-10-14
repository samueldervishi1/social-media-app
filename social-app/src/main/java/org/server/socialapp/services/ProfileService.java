package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User updateProfile(String userId, User updatedUser) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));

            updateFields(user, updatedUser);

            User updatedUserRecord = userRepository.save(user);
            logger.info("User updated successfully: {}", user.getId());
            return updatedUserRecord;

        } catch (NotFoundException e) {
            logger.error("Update failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while updating profile for user ID {}: {}", userId, e.getMessage());
            throw new InternalServerErrorException("Error updating profile");
        }
    }

    private void updateFields(User user, User updatedUser) {
        Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
        Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
        Optional.ofNullable(updatedUser.getGivenName()).ifPresent(user::setGivenName);
        Optional.ofNullable(updatedUser.getFamilyName()).ifPresent(user::setFamilyName);
        Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);

        updateLinks(user, updatedUser.getLinks());
    }

    private void updateLinks(User user, List<String> newLinks) {
        if (newLinks != null) {
            List<String> filteredNewLinks = newLinks.stream()
                    .filter(link -> link != null && !link.trim().isEmpty())
                    .map(String::toLowerCase)
                    .distinct()
                    .collect(Collectors.toList());

            user.getLinks().retainAll(filteredNewLinks);
            user.getLinks().addAll(filteredNewLinks);
        }
    }

    public void updatePassword(String userId, String oldPassword, String newPassword) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));

            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new IllegalArgumentException("Old password is incorrect");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            logger.info("Password updated successfully for user ID: {}", userId);
        } catch (NotFoundException e) {
            logger.error("Update failed: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("Update failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while updating password for user ID {}: {}", userId, e.getMessage());
            throw new InternalServerErrorException("Error updating password");
        }
    }
}
