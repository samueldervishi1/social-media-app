package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RegisterService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int SALT_LENGTH = 16;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(User user) {
        validateUser(user);

        String salt = generateSalt();
        String encodedPassword = passwordEncoder.encode(user.getPassword() + salt);

        user.setPassword(encodedPassword);
        user.setSalt(salt);
        user.setRole(user.getRole() == null ? Codes.DEFAULT_ROLE : user.getRole());
        user.setAccountCreationDate(LocalDateTime.now());

        userRepository.save(user);
    }

    private void validateUser(User user) {
        if (user == null) {
            throw new CustomException(400, "User cannot be null");
        }
        validateEmail(user.getEmail());
        validateFullName(user.getFullName());
        validatePassword(user.getPassword());
        checkDuplicateCredentials(user);
    }

    private void validateEmail(String email) {
        if (!Codes.EMAIL_PATTERN.matcher(email).matches()) {
            throw new CustomException(400, Codes.INVALID_EMAIL_FORMAT);
        }
    }

    private void validateFullName(String fullName) {
        if (!StringUtils.hasText(fullName) || fullName.length() < 2) {
            throw new CustomException(400, Codes.NAME_TOO_SHORT);
        }
    }

    private void validatePassword(String password) {
        if (!Codes.PASSWORD_PATTERN.matcher(password).matches()) {
            throw new CustomException(400, Codes.INVALID_PASSWORD_FORMAT);
        }
    }

    private void checkDuplicateCredentials(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new CustomException(400, Codes.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new CustomException(400, Codes.USERNAME_ALREADY_EXISTS);
        }
    }

    private String generateSalt() {
        byte[] saltBytes = new byte[SALT_LENGTH];
        SECURE_RANDOM.nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }
}