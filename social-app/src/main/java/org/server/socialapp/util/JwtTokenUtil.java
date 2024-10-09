package org.server.socialapp.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.server.socialapp.exceptions.InternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(String username, String userId) {
        try {
            logger.info("Generating token for username: {}", username);
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + expiration);

            String token = Jwts.builder()
                    .claim("sub", username)
                    .claim("userId", userId)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(secretKey)
                    .compact();

            logger.info("Generated token successfully");
            return token;

        } catch (Exception e) {
            logger.error("Error generating token for username {}: {}", username, e.getMessage());
            throw new InternalServerErrorException("Error generating token");
        }
    }
}
