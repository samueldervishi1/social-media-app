package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User updateProfile(String userId, User updatedUser) {
        validateUserId(userId);
        User user = findUserById(userId);
        updateUserFields(user, updatedUser);
        return userRepository.save(user);
    }

    public void updatePassword(String userId, String oldPassword, String newPassword) {
        validateUserId(userId);
        User user = findUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void softDeleteUser(String userId) {
        validateUserId(userId);
        User user = findUserById(userId);
        user.setDeleted(true);
        userRepository.save(user);
    }

    public void deactivateUser(String userId) {
        validateUserId(userId);
        User user = findUserById(userId);
        user.setDeactivated(true);
        user.setDeactivationTime(LocalDateTime.now());
        userRepository.save(user);
    }

    public void activateUser(String userId) {
        validateUserId(userId);
        User user = findUserById(userId);
        user.setDeactivated(false);
        user.setDeactivationTime(null);
        userRepository.save(user);
    }

    private void updateUserFields(User user, User updatedUser) {
        Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
        Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
        Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
        Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
        user.setTwoFa(updatedUser.isTwoFa());
    }

    private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, String.format(Codes.USER_NOT_FOUND_BY_ID, userId)));
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException(Codes.USER_ID_ERROR);
        }
    }
}