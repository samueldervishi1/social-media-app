package com.chattr.server.utils;

import com.chattr.server.services.LoggingService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Modern JWT utility using the latest JJWT API-no deprecated methods
 */
@Slf4j
@Component
public class JwtTokenUtil {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_TWO_FACTOR = "twoFactor";
    private final LoggingService loggingService;

    @Getter
    private SecretKey secretKey;
    private long expirationMillis;

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration:3600000}")
    private Long expiration;

    public JwtTokenUtil(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @PostConstruct
    public void init() {
        String optimizedSecret = secretKeyString.length() > 32 ? secretKeyString.substring(0, 32) : secretKeyString;

        this.secretKey = Keys.hmacShaKeyFor(optimizedSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expiration != null ? expiration : 3600000L;

        warmUpJWT();
    }

    private void warmUpJWT() {
        try {
            long now = System.currentTimeMillis();

            String warmupToken = Jwts.builder().subject("warmup").claim("test", "value").issuedAt(new Date(now))
                    .expiration(new Date(now + 1000)).signWith(secretKey)

                    .compact();

            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(warmupToken);
        } catch (Exception e) {
            loggingService.logError("JWT TOKEN UTIL", "warmUpJWT", "Something went wrong while warming up jw token", e);
            log.warn("JWT warmup failed: {}", e.getMessage());
        }
    }

    public String generateToken(String username, String userId, boolean twoFa) {
        long now = System.currentTimeMillis();

        return Jwts.builder().subject(username).claim(CLAIM_USER_ID, userId).claim(CLAIM_TWO_FACTOR, twoFa)
                .issuedAt(new Date(now)).expiration(new Date(now + expirationMillis)).signWith(secretKey).compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
