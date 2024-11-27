package com.chirp.server.utils;

import com.chirp.server.exceptions.InternalServerErrorException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenUtil {

	private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);
	private static final String CLAIM_SUBJECT = "sub";
	private static final String CLAIM_USER_ID = "userId";
	private static final String CLAIM_TWOFACTORAUTHENTICATION = "twoFa";

	private SecretKey secretKey;

	@Value("${jwt.expiration}")
	private Long expiration;

	@PostConstruct
	public void init() {
		this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
	}

	public String generateToken(String username , String userId , boolean twoFa) {
		try {
			logger.info("Generating token for username: {}" , username);
			Date now = new Date();
			Date expiryDate = generateExpiryDate(now);

			String token = Jwts.builder()
					.claim(CLAIM_SUBJECT , username)
					.claim(CLAIM_USER_ID , userId)
					.claim(CLAIM_TWOFACTORAUTHENTICATION , twoFa)
					.setIssuedAt(now)
					.setExpiration(expiryDate)
					.signWith(secretKey)
					.compact();

			logger.info("Generated token successfully for username: {}" , username);
			return token;

		} catch (Exception e) {
			logger.error("Error generating token for username {}: {}" , username , e.getMessage());
			throw new InternalServerErrorException("Error generating JWT token");
		}
	}

	public SecretKey getSecretKey() {
		return secretKey;
	}

	private Date generateExpiryDate(Date now) {
		return new Date(now.getTime() + expiration);
	}
}