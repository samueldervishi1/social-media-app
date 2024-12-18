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
			User user = userRepository.findByUsername(username)
					.orElseThrow(() -> new NotFoundException("Username not found"));

			if (user.isDeleted()) {
				logger.info("User does not exist");
				throw new NotFoundException("This user does not exist.");
			}

			validatePassword(password , user.getPassword());

			String token = jwtTokenUtil.generateToken(username , user.getId() , user.isTwoFa());
			logger.info("Successfully logged in user: {}" , username);
			return token;
		} catch (Exception e) {
			logger.error("Unexpected error during login attempt for user {}: {}" , username , e.getMessage());
			throw new BadRequestException("An error occurred during login.");
		}
	}

	private void validatePassword(String rawPassword , String encodedPassword) {
		if (!passwordEncoder.matches(rawPassword , encodedPassword)) {
			logger.warn("Password mismatch for username: {}" , encodedPassword);
			throw new BadRequestException("Invalid username or password");
		}
	}
}