package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Error;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.models.UserInfo;
import com.chattr.server.services.LoggingService;
import com.chattr.server.services.LoginService;
import com.chattr.server.services.RegisterService;
import com.chattr.server.utils.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.time.Duration;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller handling authentication: login, logout, register, and
 * token-based user info.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final LoginService loginService;
    private final RegisterService registerService;
    private final JwtTokenUtil jwtTokenUtil;
    private final LoggingService loggingService;

    public AuthController(LoginService loginService, RegisterService registerService, JwtTokenUtil jwtTokenUtil,
            LoggingService loggingService) {
        this.loginService = loginService;
        this.registerService = registerService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.loggingService = loggingService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> loginRequest, HttpServletResponse response,
            HttpServletRequest request) {

        logger.debug("Received login request: {}", loginRequest);
        String username = null;
        String password = null;

        try {
            Map<String, Object> parts = safeCastMap(loginRequest.get("parts"));
            Map<String, Object> spec = safeCastMap(parts.get("specification"));
            List<Map<String, Object>> characteristics = safeCastList(spec.get("characteristics-value"));

            for (Map<String, Object> item : characteristics) {
                if (item == null)
                    continue;
                String name = (String) item.get("@characteristic-name");
                Map<String, Object> valueMap = safeCastMap(item.get("value"));
                String value = valueMap != null ? (String) valueMap.get("$") : null;

                if ("username".equals(name))
                    username = value;
                if ("password".equals(name))
                    password = value;
            }

        } catch (Exception e) {
            logger.error("Invalid login format: {}", e.getMessage());
            return createErrorResponse(new CustomException(400, "Invalid request format"));
        }

        logger.debug("Extracted username: {}", username);
        logger.debug("Extracted password: {}", password != null ? "[PROTECTED]" : "null");

        if (username == null || username.isBlank()) {
            return createErrorResponse(new CustomException(400, "Username is empty"));
        }
        if (password == null || password.isBlank()) {
            return createErrorResponse(new CustomException(400, "Password is empty"));
        }

        String ipAddress = getIpAddress(request);

        try {
            String token = loginService.login(username, password, ipAddress);

            ResponseCookie cookie = ResponseCookie.from("token", token).httpOnly(true).secure(true).path("/")
                    .sameSite("None").maxAge(Duration.ofHours(4)).build();

            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok("Login successful");

        } catch (CustomException e) {
            loggingService.logError("loginController", "login", "Failed to login", e);
            return createErrorResponse(e);
        } catch (Exception e) {
            loggingService.logError("loginController", "login", "Internal Server Error", e);
            return createErrorResponse(new CustomException(500, "Internal server error"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();

        ResponseCookie cookie = ResponseCookie.from("token", "").httpOnly(true).secure(true).path("/").maxAge(0)
                .sameSite("None").build();
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String token = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(c -> "token".equals(c.getName())).map(Cookie::getValue).findFirst().orElse(null);

        if (token == null) {
            return createErrorResponse(new CustomException(401, "Token not found"));
        }

        try {
            Claims claims = jwtTokenUtil.parseToken(token);

            UserInfo userInfo = new UserInfo();
            userInfo.setUsername(claims.getSubject());
            userInfo.setUserId((String) claims.get("userId"));
            userInfo.setStatus("SUCCESS");
            userInfo.setMessage("User info retrieved from token");

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            loggingService.logError("loginController", "getCurrentUser", "Invalid token", e);
            return createErrorResponse(new CustomException(401, "Invalid token"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Error> register(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        try {
            List<Map<String, Object>> queries = safeCastList(requestBody.get("queries"));

            String username = null, email = null, fullName = null, password = null;
            boolean channelValid = false;
            for (Map<String, Object> query : queries) {
                username = getStringValue(query, "username", username);
                email = getStringValue(query, "email", email);
                fullName = getStringValue(query, "fullname", fullName);
                password = getStringValue(query, "password", password);

                Object rawQuery = query.get("query");
                if (rawQuery instanceof String str && str.contains("$.channelId=" + Messages.REQUIRED_CHANNEL_ID)) {
                    channelValid = true;
                }
            }

            if (!channelValid) {
                throw new CustomException(400, Messages.INVALID_CHANNEL_ID);
            }

            if (username == null || email == null || fullName == null || password == null) {
                throw new CustomException(400, Messages.MISSING_FIELDS);
            }

            String ipAddress = getIpAddress(request);

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(password);
            user.setIpAddress(ipAddress);
            registerService.createAccount(user);

            return ResponseEntity
                    .ok(createResponse("200", Messages.REGISTER_SUCCESS, Messages.REGISTER_SUCCESS, "success"));

        } catch (CustomException e) {
            String username = getFallbackUsername(requestBody);
            loggingService.logError("loginController", "register", "Failed to register", e);

            return ResponseEntity.badRequest()
                    .body(createResponse("400", e.getMessage(), Messages.REGISTER_FAILED, "error"));
        } catch (Exception e) {
            loggingService.logError("loginController", "register", "Internal Server Error", e);
            return ResponseEntity.internalServerError()
                    .body(createResponse("500", e.getMessage(), Messages.ERROR_500, "error"));
        }
    }

    // === Helper Methods ===

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        return (ip == null || ip.isBlank()) ? request.getRemoteAddr() : ip;
    }

    private Map<String, Object> safeCastMap(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> casted = (Map<String, Object>) map;
            return casted;
        }
        throw new CustomException(400, "Expected map but got: " + obj);
    }

    private List<Map<String, Object>> safeCastList(Object obj) {
        if (obj instanceof List<?> rawList) {
            List<Map<String, Object>> casted = new ArrayList<>();
            for (Object item : rawList) {
                if (item instanceof Map<?, ?> map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> castedMap = (Map<String, Object>) map;
                    casted.add(castedMap);
                }
            }
            if (!casted.isEmpty())
                return casted;
        }
        throw new CustomException(400, "Expected a list of maps");
    }

    private String getStringValue(Map<String, Object> map, String key, String fallback) {
        Object val = map.get(key);
        return (val instanceof String s && !s.isBlank()) ? s : fallback;
    }

    private ResponseEntity<Error> createErrorResponse(CustomException e) {
        Error error = createResponse(String.valueOf(e.getCode()), e.getMessage(), e.getMessage(), "error");
        return ResponseEntity.status(e.getCode()).body(error);
    }

    private String getFallbackUsername(Map<String, Object> requestBody) {
        try {
            List<Map<String, Object>> queries = safeCastList(requestBody.get("queries"));
            for (Map<String, Object> query : queries) {
                String val = getStringValue(query, "username", null);
                if (val != null)
                    return val;
            }
        } catch (Exception ignored) {
        }
        return "unknown";
    }

    private Error createResponse(String code, String message, String reason, String status) {
        return new Error().code(code).message(message).reason(reason).status(status).referenceError("N/A")
                .baseType("APIResponse").schemaLocation("/chattr/api/storm/provision/v1.3.2/auth")
                .type("auth_response");
    }
}
