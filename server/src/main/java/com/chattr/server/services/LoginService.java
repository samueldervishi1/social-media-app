package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.utils.JwtTokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service responsible for handling user login, validation, and session generation.
 */
@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final EmailService emailService;

    public LoginService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtTokenUtil jwtTokenUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.emailService = emailService;
    }

    /**
     * Handles user login by validating credentials, checking IP,
     * sending alerts if needed, and generating a JWT token.
     *
     * @param username  user's username
     * @param password  user's raw password
     * @param ipAddress IP address of a login attempt
     * @return JWT token if login is successful
     */
    public String login(String username, String password, String ipAddress) {
        User user = findAndValidateUser(username);
        verifyPassword(password, user);

        if (ipChanged(user.getLastLoginIp(), ipAddress)) {
            emailService.sendSecurityAlert(user.getEmail(), ipAddress);
        }

        updateLoginAudit(user, ipAddress);

        return jwtTokenUtil.generateToken(user.getUsername(), user.getId(), user.isTwoFa());
    }

    /**
     * Verifies that the provided password matches the stored one.
     */
    private void verifyPassword(String rawPassword, User user) {
        String salted = rawPassword + user.getSalt();
        if (!passwordEncoder.matches(salted, user.getPassword())) {
            throw new CustomException(401, Messages.INVALID_CREDENTIALS);
        }
    }

    /**
     * Retrieves a user by username and checks if an account is active.
     */
    private User findAndValidateUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(401, Messages.INVALID_CREDENTIALS));

        if (user.isDeleted()) {
            throw new CustomException(401, Messages.INVALID_CREDENTIALS);
        }

        return user;
    }

    /**
     * Checks if the IP address has changed since the last login.
     */
    private boolean ipChanged(String lastIp, String currentIp) {
        return lastIp == null || !lastIp.equals(currentIp);
    }

    /**
     * Updates user login timestamp and IP in the database.
     */
    private void updateLoginAudit(User user, String ipAddress) {
        user.setLastLoginIp(ipAddress);
        user.setLastLoginTime(LocalDateTime.now());
        userRepository.save(user); // Only save if audit fields have changed
    }
}