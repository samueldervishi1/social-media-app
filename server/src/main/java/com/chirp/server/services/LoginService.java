package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.utils.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

	private static final Logger logger = LoggerFactory.getLogger(LoginService.class);
	private static final String USER_NOT_FOUND = "username is incorrect";
	private static final String USER_DELETED = "This user does not exist.";
	private static final String INVALID_CREDENTIALS = "password is incorrect";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenUtil jwtTokenUtil;

	public LoginService(UserRepository userRepository , PasswordEncoder passwordEncoder , JwtTokenUtil jwtTokenUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenUtil = jwtTokenUtil;
	}

	public String login(String username , String password) {
		logger.info("Attempting to login with username {}" , username);

		User user = findAndValidateUser(username);
		validatePassword(password , user);

		return generateUserToken(user);
	}

	private User findAndValidateUser(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> {
					logger.error("Login failed for username {}: {}" , username , USER_NOT_FOUND);
					return new CustomException(404 , USER_NOT_FOUND);
				});

		if (user.isDeleted()) {
			logger.error("Login failed for username {}: {}" , username , USER_DELETED);
			throw new CustomException(404 , USER_DELETED);
		}

		return user;
	}

	private void validatePassword(String rawPassword , User user) {
		if (!passwordEncoder.matches(rawPassword + user.getSalt() , user.getPassword())) {
			logger.warn("Password mismatch for user: {}" , user.getUsername());
			throw new CustomException(400 , INVALID_CREDENTIALS);
		}
	}


	private String generateUserToken(User user) {
		String token = jwtTokenUtil.generateToken(user.getUsername() , user.getId() , user.isTwoFa());
		logger.info("Successfully logged in user: {}" , user.getUsername());
		return token;
	}
}