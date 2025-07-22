package com.chattr.server.utils;

import com.chattr.server.services.LoggingService;
import com.mongodb.lang.NonNull;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT authentication filter for processing incoming requests and verifying
 * authentication tokens stored in cookies.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String TOKEN_COOKIE_NAME = "token";
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final JwtTokenUtil jwtTokenUtil;
    private final LoggingService loggingService;

    @Value("#{'${chattr.security.public-urls}'.split(',')}")
    private List<String> publicUrls;

    @Autowired
    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, LoggingService loggingService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.loggingService = loggingService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String sessionId = loggingService.getCurrentSessionId();

        setSecurityHeaders(response);

        if (isPublicEndpoint(uri)) {
            loggingService.logDebug("JWTFilter", "doFilterInternal",
                    String.format("Public endpoint accessed: %s %s from IP %s", method, uri, sessionId));
            filterChain.doFilter(request, response);
            return;
        }

        try {
            loggingService.logDebug("JWTFilter", "doFilterInternal",
                    String.format("Processing protected endpoint: %s %s from IP %s", method, uri, sessionId));

            String token = extractTokenFromCookies(request);

            if (token == null || token.trim().isEmpty()) {
                loggingService.logSecurityEvent("AUTH_TOKEN_MISSING", "anonymous", sessionId,
                        String.format("Missing token for %s %s from IP %s", method, uri, sessionId));

                loggingService.logWarn("JWTFilter", "doFilterInternal",
                        String.format("Authentication required for %s %s from IP %s", method, uri, sessionId));

                sendErrorResponse(response, "Authentication required");
                return;
            }

            if (!isValidTokenFormat(token)) {
                loggingService.logSecurityEvent("AUTH_TOKEN_INVALID_FORMAT", "anonymous", sessionId,
                        String.format("Invalid token format for %s %s from IP %s", method, uri, sessionId));

                loggingService.logWarn("JWTFilter", "doFilterInternal",
                        String.format("Invalid token format for %s %s from IP %s", method, uri, sessionId));

                sendErrorResponse(response, "Invalid token format");
                return;
            }

            Claims claims = parseTokenSafely(token);
            if (claims == null) {
                loggingService.logSecurityEvent("AUTH_TOKEN_EXPIRED", "anonymous", sessionId,
                        String.format("Invalid/expired token for %s %s from IP %s", method, uri, sessionId));

                loggingService.logWarn("JWTFilter", "doFilterInternal",
                        String.format("Invalid or expired token for %s %s from IP %s", method, uri, sessionId));

                sendErrorResponse(response, "Invalid or expired token");
                return;
            }

            String username = claims.getSubject();
            if (username == null || username.trim().isEmpty()) {
                loggingService.logSecurityEvent("AUTH_TOKEN_INVALID_CONTENT", "anonymous", sessionId,
                        String.format("Token with invalid content for %s %s from IP %s", method, uri, sessionId));

                loggingService.logWarn("JWTFilter", "doFilterInternal",
                        String.format("Invalid token content for %s %s from IP %s", method, uri, sessionId));

                sendErrorResponse(response, "Invalid token content");
                return;
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, null);
            SecurityContextHolder.getContext().setAuthentication(auth);

            loggingService.logDebug("JWTFilter", "doFilterInternal",
                    String.format("Authentication successful for user %s accessing %s %s", username, method, uri));

        } catch (Exception e) {
            loggingService.logSecurityEvent("AUTH_SYSTEM_ERROR", "anonymous", sessionId, String.format(
                    "Authentication system error for %s %s from IP %s: %s", method, uri, sessionId, e.getMessage()));

            loggingService.logError("JWTFilter", "doFilterInternal",
                    String.format("Unexpected error in JWT filter for %s %s from IP %s", method, uri, sessionId), e);

            sendErrorResponse(response, "Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void setSecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-Content-Type-Options", "nosniff");
    }

    private boolean isPublicEndpoint(String uri) {
        for (String publicUrl : publicUrls) {
            if (pathMatcher.match(publicUrl.trim(), uri)) {
                return true;
            }
        }
        return false;
    }

    private boolean isValidTokenFormat(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        for (String part : parts) {
            if (part.trim().isEmpty()) {
                return false;
            }
        }

        return true;
    }

    private Claims parseTokenSafely(String token) {
        try {
            SecretKey key = jwtTokenUtil.getSecretKey();
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();

        } catch (Exception e) {
            return null;
        }
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format("{\"error\":\"%s\"}", message);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}
