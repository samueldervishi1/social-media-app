package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.utils.JwtTokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;


@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final EmailService emailService;

    public LoginService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.emailService = emailService;
    }

    public String login(String username, String password, String ipAddress) {
        User user = findAndValidateUser(username);
        validatePassword(password, user);

		if (user.getLastLoginIp() == null || !user.getLastLoginIp().equals(ipAddress)) {
			emailService.sendSecurityAlert(user.getEmail(), ipAddress);
		}

		user.setLastLoginIp(ipAddress);
		user.setLastLoginTime(LocalDateTime.now());
		userRepository.save(user);

        return generateUserToken(user);
    }

    private User findAndValidateUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(404, Codes.USERNAME_INCORRECT));

        if (user.isDeleted()) {
            throw new CustomException(404, Codes.USER_DELETED);
        }
        return user;
    }

    private void validatePassword(String rawPassword, User user) {
        if (!passwordEncoder.matches(rawPassword + user.getSalt(), user.getPassword())) {
            throw new CustomException(400, Codes.INVALID_CREDENTIALS);
        }
    }

    private String generateUserToken(User user) {
        return jwtTokenUtil.generateToken(user.getUsername(), user.getId(), user.isTwoFa());
    }
}