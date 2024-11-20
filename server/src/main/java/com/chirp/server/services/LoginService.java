package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.utils.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

	private static final Logger logger = LoggerFactory.getLogger(LoginService.class);

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	public String login(String username , String password) {
		logger.info("Attempting to login with username {}" , username);

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("Username not found"));

		if (user.isDeleted()) {
            logger.info("User does not exist");
			throw new NotFoundException("This user does not exist.");
		}

		validatePassword(password , user.getPassword());

		String token = jwtTokenUtil.generateToken(username , user.getId());
		logger.info("Successfully logged in user: {}" , username);
		return token;
	}

	private void validatePassword(String rawPassword , String encodedPassword) {
		if (!passwordEncoder.matches(rawPassword , encodedPassword)) {
			logger.warn("Password mismatch for username: {}" , encodedPassword);
			throw new BadRequestException("Invalid username or password");
		}
	}
}
