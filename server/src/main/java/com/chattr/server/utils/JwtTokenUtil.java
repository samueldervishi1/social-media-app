package com.chattr.server.utils;

import com.chattr.server.exceptions.CustomException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;


/**
 * Utility class for generation and parsing JWT tokens.
 * Includes both access and refresh token creation
 */
@Slf4j
@Component
public class JwtTokenUtil {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_TWO_FACTOR = "twoFactor";

    @Getter
    private SecretKey secretKey;

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration:3600000}") // 1 hour in ms by default
    private Long expiration;

    /**
     * Initializes the HMAC secret key after the component is constructed
     */
    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
        log.info("JWT Secret Key initialized successfully");
    }

    /**
     * Generates a signed JWT access token.
     *
     * @param username the username (set as subject)
     * @param userId   the user’s unique ID (custom claim)
     * @param twoFa    whether 2FA is enabled (custom claim)
     * @return a signed JWT token
     */
    public String generateToken(String username, String userId, boolean twoFa) {
        return generateTokenInternal(username, userId, twoFa, calculateExpiryDate(Instant.now()));
    }

    /**
     * Centralized logic for token generation
     */
    public String generateTokenInternal(String username, String userId, boolean twoFa, Instant expiryDate) {
        try {
            Instant now = Instant.now();

            return Jwts.builder()
                    .subject(username)
                    .claim(CLAIM_USER_ID, userId)
                    .claim(CLAIM_TWO_FACTOR, twoFa)
                    .issuedAt(Date.from(now))
                    .expiration(Date.from(expiryDate))
                    .signWith(secretKey)
                    .compact();
        } catch (Exception e) {
            log.error("Error generating JWT token", e);
            throw new CustomException("Error generating JWT token");
        }
    }

    /**
     * Extracts the expiration date from a valid JWT.
     *
     * @param token the JWT string
     * @return expiration date
     */
    public Date getExpiryDate(String token) {
        return parseToken(token).getExpiration();
    }

    /**
     * Parses a JWT and returns its claims (payload).
     *
     * @param token the JWT string
     * @return parsed Claims
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (Exception e) {
            log.error("Error parsing JWT token", e);
            throw new CustomException("Invalid token");
        }
    }

    /**
     * Calculates expiration time based on configuration.
     * Falls back to 1 hour if misconfigured.
     */
    private Instant calculateExpiryDate(Instant now) {
        if (expiration == null || expiration <= 0) {
            log.warn("Invalid expiration configured. Falling back to 1 hour.");
            return now.plus(1, ChronoUnit.HOURS);
        }
        return now.plus(expiration, ChronoUnit.MILLIS);
    }
}