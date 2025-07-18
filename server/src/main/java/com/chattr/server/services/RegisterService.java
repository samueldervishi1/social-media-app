package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** Service responsible for validating and registering new users. */
@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(User user) {
        validateUser(user);

        String encodedPassword = passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);
        user.setRole(user.getRole() != null ? user.getRole() : Messages.DEFAULT_ROLE);
        user.setAccountCreationDate(LocalDateTime.now());

        userRepository.save(user);
    }

    private void validateUser(User user) {
        if (user == null)
            throw new CustomException(400, String.format(Messages.USER_SHOULD_NOT_BE_NULL));
        validateEmail(user.getEmail());
        validateFullName(user.getFullName());
        validatePassword(user.getPassword());
        checkDuplicates(user);
    }

    private void validateEmail(String email) {
        if (!Messages.EMAIL_PATTERN.matcher(email).matches()) {
            throw new CustomException(400, Messages.INVALID_EMAIL_FORMAT);
        }
    }

    private void validateFullName(String fullName) {
        if (!StringUtils.hasText(fullName) || fullName.length() < 2) {
            throw new CustomException(400, Messages.NAME_TOO_SHORT);
        }
    }

    private void validatePassword(String password) {
        if (!Messages.PASSWORD_PATTERN.matcher(password).matches()) {
            throw new CustomException(400, Messages.INVALID_PASSWORD_FORMAT);
        }
    }

    private void checkDuplicates(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new CustomException(400, Messages.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new CustomException(400, Messages.USERNAME_ALREADY_EXISTS);
        }
    }
}
