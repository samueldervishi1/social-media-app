package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User updateProfile(String userId, User updatedUser) {
        try {
            User user = userRepository.findById(userId).orElseThrow(()
                    -> new NotFoundException("User not found with ID: " + userId)
            );

            if (updatedUser.getBio() != null) {
                user.setBio(updatedUser.getBio());
            }

            if (updatedUser.getRole() != null) {
                user.setRole(updatedUser.getRole());
            } else {
                user.setRole("simple_account");
            }

            if (updatedUser.getTitle() != null) {
                user.setTitle(updatedUser.getTitle());
            }

            if (updatedUser.getGivenName() != null) {
                user.setGivenName(updatedUser.getGivenName());
            }

            if (updatedUser.getFamilyName() != null) {
                user.setFamilyName(updatedUser.getFamilyName());
            }

            if (updatedUser.getLinks() != null) {
                List<String> newLinks = updatedUser.getLinks().stream()
                        .filter(link -> link != null && !link.trim().isEmpty())
                        .collect(Collectors.toList());

                List<String> currentLinks = user.getLinks().stream()
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());
                List<String> newLinksLower = newLinks.stream()
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                List<String> linksToRemove = currentLinks.stream()
                        .filter(link -> !newLinksLower.contains(link))
                        .collect(Collectors.toList());

                user.getLinks().removeAll(linksToRemove);

                List<String> linksToAdd = newLinksLower.stream()
                        .filter(link -> !currentLinks.contains(link))
                        .collect(Collectors.toList());

                user.getLinks().addAll(linksToAdd.stream()
                        .map(link -> newLinks.get(newLinksLower.indexOf(link)))
                        .collect(Collectors.toList()));
            }

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

    public void updatePassword(String userId, String oldPassword, String newPassword) {
        try {
            User user = userRepository.findById(userId).orElseThrow(()
                    -> new NotFoundException("User not found with ID: " + userId)
            );

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
