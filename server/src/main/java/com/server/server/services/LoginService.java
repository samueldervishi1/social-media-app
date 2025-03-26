package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.User;
import com.server.server.repositories.UserRepository;
import com.server.server.utils.JwtTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Slf4j
@Service
public class LoginService {
	private static final String USER_NOT_FOUND = "Username is incorrect";
	private static final String USER_DELETED = "This user does not exist.";
	private static final String INVALID_CREDENTIALS = "Password is incorrect";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenUtil jwtTokenUtil;

	public LoginService(UserRepository userRepository , PasswordEncoder passwordEncoder , JwtTokenUtil jwtTokenUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenUtil = jwtTokenUtil;
	}

	public String login(String username , String password) {
		User user = findAndValidateUser(username);
		validatePassword(password , user);

		return generateUserToken(user);
	}

	private User findAndValidateUser(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(404 , USER_NOT_FOUND));

		if (user.isDeleted()) {
			throw new CustomException(404 , USER_DELETED);
		}

		return user;
	}

	private void validatePassword(String rawPassword , User user) {
		if (!passwordEncoder.matches(rawPassword + user.getSalt() , user.getPassword())) {
			throw new CustomException(400 , INVALID_CREDENTIALS);
		}
	}

	public String getTimeUntilExpiry(String token) {
		Instant expiry = jwtTokenUtil.getExpiryDate(token).toInstant();
		Duration duration = Duration.between(Instant.now() , expiry);
		long totalSeconds = duration.getSeconds();
		long minutes = totalSeconds / 60;
		long seconds = totalSeconds % 60;
		return String.format("%d minutes %d seconds" , minutes , seconds);
	}

	private String generateUserToken(User user) {
		return jwtTokenUtil.generateToken(user.getUsername() , user.getId() , user.isTwoFa());
	}
}
