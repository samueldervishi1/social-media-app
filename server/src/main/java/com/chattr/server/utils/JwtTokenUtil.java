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

@Slf4j
@Component
public class JwtTokenUtil {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_TWOFACTORAUTHENTICATION = "twoFa";

    @Getter
    private SecretKey secretKey;

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration:3600000}")
    private Long expiration;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
        log.info("JWT Secret Key initialized successfully");
    }

    public String generateToken(String username, String userId, boolean twoFa) {
        try {
            Instant now = Instant.now();
            Instant expiryDate = calculateExpiryDate(now);

            return Jwts.builder()
                    .subject(username)
                    .claim(CLAIM_USER_ID, userId)
                    .claim(CLAIM_TWOFACTORAUTHENTICATION, twoFa)
                    .issuedAt(Date.from(now))
                    .expiration(Date.from(expiryDate))
                    .signWith(secretKey)
                    .compact();
        } catch (Exception e) {
            log.error("Error generating JWT token", e);
            throw new CustomException("Error generating JWT token");
        }
    }

    public String generateRefreshToken(String username, String userId, boolean twoFa) {
        try {
            Instant now = Instant.now();
            Instant expiryDate = now.plus(1, ChronoUnit.HOURS);

            return Jwts.builder()
                    .subject(username)
                    .claim(CLAIM_USER_ID, userId)
                    .claim(CLAIM_TWOFACTORAUTHENTICATION, twoFa)
                    .issuedAt(Date.from(now))
                    .expiration(Date.from(expiryDate))
                    .signWith(secretKey)
                    .compact();
        } catch (Exception e) {
            log.error("Error generating refresh JWT token", e);
            throw new CustomException("Error generating refresh JWT token");
        }
    }

    public Date getExpiryDate(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

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

    private Instant calculateExpiryDate(Instant now) {
        if (expiration <= 0) {
            log.warn("Invalid expiration time configured. Using default.");
            return now.plus(1, ChronoUnit.HOURS);
        }
        return now.plus(expiration, ChronoUnit.MILLIS);
    }
}