package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
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
	private static final String USER_NOT_FOUND = "Username not found";
	private static final String USER_DELETED = "This user does not exist.";
	private static final String INVALID_CREDENTIALS = "Invalid username or password";
	private static final String LOGIN_ERROR = "An error occurred during login.";

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

		try {
			User user = findAndValidateUser(username);
			validatePassword(password , user);
			return generateUserToken(user);
		} catch (NotFoundException | BadRequestException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error during login attempt for user {}: {}" , username , e.getMessage());
			throw new BadRequestException(LOGIN_ERROR);
		}
	}

	private User findAndValidateUser(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException(USER_NOT_FOUND));

		if (user.isDeleted()) {
			logger.info("User does not exist");
			throw new NotFoundException(USER_DELETED);
		}

		return user;
	}

	private void validatePassword(String rawPassword , User user) {
		if (!passwordEncoder.matches(rawPassword + user.getSalt() , user.getPassword())) {
			logger.warn("Password mismatch for user: {}" , user.getUsername());
			throw new BadRequestException(INVALID_CREDENTIALS);
		}
	}

	private String generateUserToken(User user) {
		String token = jwtTokenUtil.generateToken(user.getUsername() , user.getId() , user.isTwoFa());
		logger.info("Successfully logged in user: {}" , user.getUsername());
		return token;
	}
}