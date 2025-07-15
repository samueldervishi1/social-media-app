package com.chattr.server.utils;

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

/** Modern JWT utility using the latest JJWT API-no deprecated methods */
@Slf4j
@Component
public class JwtTokenUtil {

  private static final String CLAIM_USER_ID = "userId";
  private static final String CLAIM_TWO_FACTOR = "twoFactor";

  @Getter private SecretKey secretKey;
  private long expirationMillis;

  @Value("${jwt.secret}")
  private String secretKeyString;

  @Value("${jwt.expiration:3600000}")
  private Long expiration;

  @PostConstruct
  public void init() {
    // Use the first 32 characters for optimal HS256 performance
    String optimizedSecret =
        secretKeyString.length() > 32 ? secretKeyString.substring(0, 32) : secretKeyString;

    this.secretKey = Keys.hmacShaKeyFor(optimizedSecret.getBytes(StandardCharsets.UTF_8));
    this.expirationMillis = expiration != null ? expiration : 3600000L;

    // Warm up crypto operations
    warmUpJWT();

    log.info("JWT initialized with modern API and optimized secret");
  }

  /** Warm up JWT operations using modern API */
  private void warmUpJWT() {
    try {
      long now = System.currentTimeMillis();

      // Generate warmup token using modern API
      String warmupToken =
          Jwts.builder()
              .subject("warmup")
              .claim("test", "value")
              .issuedAt(new Date(now))
              .expiration(new Date(now + 1000))
              .signWith(secretKey) // Modern way - no deprecated SignatureAlgorithm
              .compact();

      // Parse it back to complete the warmup
      Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(warmupToken);

      log.debug("JWT crypto operations warmed up successfully");
    } catch (Exception e) {
      log.warn("JWT warmup failed: {}", e.getMessage());
    }
  }

  /** Generate JWT token using modern JJWT API */
  public String generateToken(String username, String userId, boolean twoFa) {
    long now = System.currentTimeMillis();

    return Jwts.builder()
        .subject(username)
        .claim(CLAIM_USER_ID, userId)
        .claim(CLAIM_TWO_FACTOR, twoFa)
        .issuedAt(new Date(now))
        .expiration(new Date(now + expirationMillis))
        .signWith(secretKey) // Modern API automatically selects best algorithm
        .compact();
  }

  /** Parse JWT token using modern API */
  public Claims parseToken(String token) {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
  }
}
