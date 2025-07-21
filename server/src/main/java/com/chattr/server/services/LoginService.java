package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.utils.JwtTokenUtil;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final OAuth2EmailService emailService;
    private final LoggingService loggingService;

    public String login(String username, String password, String ipAddress) {
        long totalStart = System.currentTimeMillis();

        long step1Start = System.currentTimeMillis();
        User user = findAndValidateUser(username);
        long step1Duration = System.currentTimeMillis() - step1Start;
        loggingService.logExecutionTime("LoginService", "findAndValidateUser", step1Duration);

        long step2Start = System.currentTimeMillis();
        verifyPassword(password, user);
        long step2Duration = System.currentTimeMillis() - step2Start;
        loggingService.logExecutionTime("LoginService", "verifyPassword", step2Duration);

        long step3Start = System.currentTimeMillis();
        String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId(), user.isTwoFa());
        long step3Duration = System.currentTimeMillis() - step3Start;
        loggingService.logExecutionTime("LoginService", "generateToken", step3Duration);

        long step4Start = System.currentTimeMillis();
        runPostLoginAsync(user, ipAddress, username);
        long step4Duration = System.currentTimeMillis() - step4Start;
        loggingService.logExecutionTime("LoginService", "runPostLoginAsync", step4Duration);

        long totalDuration = System.currentTimeMillis() - totalStart;
        loggingService.logExecutionTime("LoginService", "login", totalDuration);

        loggingService.logUserActivity(user.getId(), username, "login", ipAddress);

        return token;
    }

    private User findAndValidateUser(String username) {
        return userRepository.findByUsername(username).filter(user -> !user.isDeleted())
                .orElseThrow(() -> new CustomException(401, Messages.INVALID_CREDENTIALS));
    }

    private void verifyPassword(String rawPassword, User user) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException(401, Messages.INVALID_CREDENTIALS);
        }
    }

    private void runPostLoginAsync(User user, String ipAddress, String username) {
        CompletableFuture.runAsync(() -> {
            try {
                if (ipChanged(user.getLastLoginIp(), ipAddress)) {
                    emailService.sendSecurityAlert(user.getEmail(), ipAddress);
                }
                updateLoginMetadata(user, ipAddress);
                userRepository.save(user);
            } catch (Exception e) {
                loggingService.logError("LoginService", "runPostLoginAsync", "Post-login error for user: " + username,
                        e);
            }
        });
    }

    private boolean ipChanged(String lastIp, String currentIp) {
        return lastIp == null || !lastIp.equals(currentIp);
    }

    private void updateLoginMetadata(User user, String ipAddress) {
        LocalDateTime now = LocalDateTime.now();
        if (user.getFirstTimeLoggedIn() == null) {
            user.setFirstTimeLoggedIn(now);
            user.setLoginStreak(1);
        }
        user.setLastLoginIp(ipAddress);
        user.setLastLoginTime(now);
    }
}
