package com.chattr.server.controllers;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Error;
import com.chattr.server.models.User;
import com.chattr.server.models.UserInfo;
import com.chattr.server.services.LoginService;
import com.chattr.server.services.RegisterService;
import com.chattr.server.utils.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final LoginService loginService;
    private final RegisterService registerService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthController(LoginService loginService, RegisterService registerService, JwtTokenUtil jwtTokenUtil) {
        this.loginService = loginService;
        this.registerService = registerService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> loginRequest, HttpServletResponse response, HttpServletRequest request) {
        logger.debug("Received login request: {}", loginRequest);
        String username = null;
        String password = null;

        try {
            if (loginRequest.containsKey("parts") && loginRequest.get("parts") instanceof Map) {
                logger.debug("Processing 'parts' section");
                @SuppressWarnings("unchecked")
                Map<String, Object> parts = (Map<String, Object>) loginRequest.get("parts");

                if (parts.containsKey("specification") && parts.get("specification") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> specification = (Map<String, Object>) parts.get("specification");

                    if (specification.containsKey("characteristics-value")) {
                        Object charObj = specification.get("characteristics-value");
                        if (charObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> characteristics = (List<Map<String, Object>>) charObj;

                            for (Map<String, Object> charItem : characteristics) {
                                if (charItem != null) {
                                    String charName = (String) charItem.get("@characteristic-name");
                                    if (charItem.containsKey("value") && charItem.get("value") instanceof Map) {
                                        @SuppressWarnings("unchecked")
                                        Map<String, Object> valueMap = (Map<String, Object>) charItem.get("value");
                                        String value = valueMap != null ? (String) valueMap.get("$") : null;

                                        if ("username".equals(charName)) {
                                            username = value;
                                        } else if ("password".equals(charName)) {
                                            password = value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (ClassCastException e) {
            logger.error("Invalid request format: {}", e.getMessage());
            return createErrorResponse(new CustomException(400, "Invalid request format"));
        }

        logger.debug("Extracted username: {}", username);
        logger.debug("Extracted password: {}", password != null ? "[PROTECTED]" : "null");

        if ((username == null || username.isEmpty()) && (password == null || password.isEmpty())) {
            return createErrorResponse(new CustomException(400, "Username or password is empty"));
        }
        if (username == null || username.isEmpty()) {
            return createErrorResponse(new CustomException(400, "Username is empty"));
        }
        if (password == null || password.isEmpty()) {
            return createErrorResponse(new CustomException(400, "Password is empty"));
        }

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }

        try {
            String token = loginService.login(username, password, ipAddress);
            String cookieValue = "token=" + token
                    + "; Path=/"
                    + "; HttpOnly"
                    + "; Secure"
                    + "; SameSite=None"
                    + "; Partitioned";

            response.setHeader("Set-Cookie", cookieValue);

            return ResponseEntity.ok("Login successful");
        } catch (CustomException e) {
            return createErrorResponse(e);
        } catch (Exception e) {
            return createErrorResponse(new CustomException(500, "An internal server error occurred"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        String clearedCookie = cookie + "; Partitioned";

        response.setHeader("Set-Cookie", clearedCookie);

        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String token = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token not found");
        }

        try {
            Claims claims = jwtTokenUtil.parseToken(token);

            UserInfo response = new UserInfo();
            response.setUsername(claims.getSubject());
            response.setUserId((String) claims.get("userId"));
            response.setStatus("SUCCESS");
            response.setMessage("User info retrieved from token");
            logger.info("User info retrieved from token: {}", response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Error> register(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        try {
            Object queriesObj = requestBody.get("queries");
            List<Map<String, Object>> queries = getMaps(queriesObj);

            String username = null, email = null, fullName = null, password = null;

            for (Map<String, Object> query : queries) {
                username = getStringValue(query, "username", username);
                email = getStringValue(query, "email", email);
                fullName = getStringValue(query, "fullname", fullName);
                password = getStringValue(query, "password", password);
            }

            if (username == null || email == null || fullName == null || password == null) {
                throw new CustomException(400, Messages.MISSING_FIELDS);
            }

			String ipAddress = request.getHeader("X-Forwarded-For");

			if (ipAddress == null || ipAddress.isBlank()) {
				ipAddress = request.getRemoteAddr();
			}

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(password);
            user.setIpAddress(ipAddress);

            registerService.createUser(user);

            return ResponseEntity.ok(createResponse("200", Messages.REGISTER_SUCCESS,
                    Messages.REGISTER_SUCCESS, "success"));

        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createResponse("400", e.getMessage(), Messages.REGISTER_FAILED, "error"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createResponse("500", e.getMessage(),
                            Messages.ERROR_500, "error"));
        }
    }

    private static List<Map<String, Object>> getMaps(Object queriesObj) {
        if (!(queriesObj instanceof List<?> queriesList)) {
            throw new CustomException(400, "Invalid request format: queries must be a list");
        }

        if (queriesList.isEmpty()) {
            throw new CustomException(400, "Invalid request format: queries list is empty");
        }

        List<Map<String, Object>> queries = new ArrayList<>();
        for (Object item : queriesList) {
            if (item instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> queryMap = (Map<String, Object>) item;
                queries.add(queryMap);
            }
        }

        if (queries.isEmpty()) {
            throw new CustomException(400, "Invalid request format: no valid query maps found");
        }
        return queries;
    }

    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        if (map.containsKey(key) && map.get(key) instanceof String) {
            return (String) map.get(key);
        }
        return defaultValue;
    }

    private ResponseEntity<Error> createErrorResponse(CustomException exception) {
        Error errorResponse = new Error();
        errorResponse.setCode(String.valueOf(exception.getCode()));
        errorResponse.setMessage(exception.getMessage());
        return ResponseEntity.status(exception.getCode()).body(errorResponse);
    }

    private Error createResponse(String code, String message, String reason, String status) {
        Error response = new Error();
        response.setCode(code);
        response.setMessage(message);
        response.setReason(reason);
        response.setStatus(status);
        response.setReferenceError("N/A");
        response.setBaseType("APIResponse");
        response.setSchemaLocation("/tmf/server/api/v2.2.10/register");
        response.setType("registration_response");
        return response;
    }

}