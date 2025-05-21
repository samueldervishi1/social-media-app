package com.chattr.server.utils;

import com.mongodb.lang.NonNull;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Arrays;

/**
 * JWT authentication filter for processing incoming requests and
 * verifying authentication tokens stored in cookies.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String TOKEN_COOKIE_NAME = "token";

    @Value("${security.public-urls}")
    private String[] publicUrls;

    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        setSecurityHeaders(response);

        // 2. Skip filtering for public URLs
        if (isPublicEndpoint(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract and validate JWT token from cookie
        String token = extractTokenFromCookies(request);

        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token cookie is missing");
            return;
        }

        try {
            Claims claims = parseToken(token);
            String username = claims.getSubject();

            // Set the authenticated user in the Spring Security context
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(username, null, null);
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            logger.error("Invalid token", e);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid token");
            return;
        }

        // 4. Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the token from the "token" cookie.
     */
    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if (TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * Adds security-related HTTP headers to the response.
     */
    private void setSecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-Content-Type-Options", "nosniff");
    }

    /**
     * Checks if the given URI is publicly accessible and should bypass authentication.
     */
    private boolean isPublicEndpoint(String uri) {
        return Arrays.asList(publicUrls).contains(uri);
    }

    /**
     * Parses and verifies the JWT token using the configured secret key.
     */
    private Claims parseToken(String token) {
        SecretKey key = jwtTokenUtil.getSecretKey();
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}