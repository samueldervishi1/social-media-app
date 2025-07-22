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
        String sessionId = loggingService.getCurrentSessionId();
        long totalStart = System.currentTimeMillis();

        try {
            loggingService.logInfo("LoginService", "login",
                    String.format("Login attempt for username: %s from IP: %s", username, ipAddress));

            loggingService.logSecurityEvent("LOGIN_ATTEMPT", username, sessionId,
                    String.format("User %s attempting login from IP %s", username, ipAddress));

            long step1Start = System.currentTimeMillis();
            User user = findAndValidateUser(username);
            long step1Duration = System.currentTimeMillis() - step1Start;
            loggingService.logExecutionTime("LoginService", "findAndValidateUser", step1Duration);
            loggingService.logDebug("LoginService", "login",
                    String.format("User validation completed for %s in %dms", username, step1Duration));

            long step2Start = System.currentTimeMillis();
            verifyPassword(password, user);
            long step2Duration = System.currentTimeMillis() - step2Start;
            loggingService.logExecutionTime("LoginService", "verifyPassword", step2Duration);
            loggingService.logDebug("LoginService", "login",
                    String.format("Password verification completed for %s in %dms", username, step2Duration));

            long step3Start = System.currentTimeMillis();
            String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId(), user.isTwoFa());
            long step3Duration = System.currentTimeMillis() - step3Start;
            loggingService.logExecutionTime("LoginService", "generateToken", step3Duration);
            loggingService.logDebug("LoginService", "login",
                    String.format("JWT token generated for %s in %dms", username, step3Duration));

            long step4Start = System.currentTimeMillis();
            runPostLoginAsync(user, ipAddress, username, sessionId);
            long step4Duration = System.currentTimeMillis() - step4Start;
            loggingService.logExecutionTime("LoginService", "runPostLoginAsync", step4Duration);
            loggingService.logDebug("LoginService", "login",
                    String.format("Post-login async tasks initiated for %s in %dms", username, step4Duration));

            long totalDuration = System.currentTimeMillis() - totalStart;
            loggingService.logExecutionTime("LoginService", "login", totalDuration);

            loggingService.logUserActivity(user.getId(), username, "login", ipAddress);

            loggingService.logSecurityEvent("LOGIN_SUCCESS", username, sessionId,
                    String.format("User %s successfully logged in from IP %s (total time: %dms)", username, ipAddress,
                            totalDuration));

            loggingService.logInfo("LoginService", "login",
                    String.format("Login successful for %s from IP %s in %dms", username, ipAddress, totalDuration));

            return token;

        } catch (CustomException e) {
            long totalDuration = System.currentTimeMillis() - totalStart;

            loggingService.logSecurityEvent("LOGIN_FAILED", username, sessionId,
                    String.format("Login failed for %s from IP %s: %s (time: %dms)", username, ipAddress,
                            e.getMessage(), totalDuration));

            loggingService.logWarn("LoginService", "login",
                    String.format("Login failed for %s from IP %s: %s", username, ipAddress, e.getMessage()));

            throw e;

        } catch (Exception e) {
            long totalDuration = System.currentTimeMillis() - totalStart;

            loggingService.logSecurityEvent("LOGIN_ERROR", username, sessionId, String.format(
                    "System error during login for %s from IP %s (time: %dms)", username, ipAddress, totalDuration));

            loggingService.logError("LoginService", "login",
                    String.format("Unexpected error during login for %s from IP %s", username, ipAddress), e);

            throw new CustomException(500, "Login system error");
        }
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

    private void runPostLoginAsync(User user, String ipAddress, String username, String sessionId) {
        CompletableFuture.runAsync(() -> {
            try {
                loggingService.logDebug("LoginService", "runPostLoginAsync",
                        String.format("Starting post-login tasks for %s", username));

                if (ipChanged(user.getLastLoginIp(), ipAddress)) {
                    loggingService.logInfo("LoginService", "runPostLoginAsync", String
                            .format("IP change detected for %s: %s -> %s", username, user.getLastLoginIp(), ipAddress));

                    loggingService.logSecurityEvent("LOGIN_IP_CHANGED", username, sessionId,
                            String.format("User %s logged in from new IP %s (previous: %s)", username, ipAddress,
                                    user.getLastLoginIp()));

                    emailService.sendSecurityAlert(user.getEmail(), ipAddress);
                    loggingService.logInfo("LoginService", "runPostLoginAsync",
                            String.format("Security alert email sent to %s for IP change", user.getEmail()));
                } else {
                    loggingService.logDebug("LoginService", "runPostLoginAsync",
                            String.format("No IP change detected for %s (IP: %s)", username, ipAddress));
                }

                updateLoginMetadata(user, ipAddress);
                userRepository.save(user);

                loggingService.logDebug("LoginService", "runPostLoginAsync",
                        String.format("Login metadata updated and saved for %s", username));

                loggingService.logInfo("LoginService", "runPostLoginAsync",
                        String.format("Post-login tasks completed successfully for %s", username));

            } catch (Exception e) {
                loggingService.logSecurityEvent("POST_LOGIN_ERROR", username, sessionId,
                        String.format("Post-login tasks failed for %s: %s", username, e.getMessage()));

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
