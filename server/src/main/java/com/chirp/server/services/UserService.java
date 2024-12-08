package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private static final String DEFAULT_ROLE = "simple_account";
	private static final String INVALID_EMAIL_FORMAT = "Invalid email format";
	private static final String EMAIL_ALREADY_EXISTS = "Email already exists";
	private static final String USERNAME_ALREADY_EXISTS = "Username already exists";
	private static final String NAME_TOO_SHORT = "Full name should be at least 2 characters long";
	private static final String INVALID_PASSWORD_FORMAT = "Password should be at least 8 characters long, including one letter, one symbol and one number";

	public User createUser(User user) {
		validateUser(user);

		user.setPassword(passwordEncoder.encode(user.getPassword()));

		user.setRole(Optional.ofNullable(user.getRole()).orElse(DEFAULT_ROLE));
		logger.info("Creating user: {}" , user.getUsername());
		return userRepository.save(user);
	}

	public User getUserInfo(String username) {
		return userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found with username: " + username));
	}

	public User getUserInfoById(String id) {
		return userRepository.findUserById(id).orElseThrow(() -> new NotFoundException("User not found with ID: " + id));
	}

	private void validateUser(User user) {
		if (!isValidEmail(user.getEmail())) {
			throw new BadRequestException(INVALID_EMAIL_FORMAT);
		}
		if (userRepository.existsByEmail(user.getEmail())) {
			logger.error("Email already exists: {}" , user.getEmail());
			throw new BadRequestException(EMAIL_ALREADY_EXISTS);
		}
		if (userRepository.existsByUsername(user.getUsername())) {
			logger.error("Username already exists: {}" , user.getUsername());
			throw new BadRequestException(USERNAME_ALREADY_EXISTS);
		}
		if (!isValidLength(user.getFullName())) {
			throw new BadRequestException(NAME_TOO_SHORT);
		}
		if (!isValidPassword(user.getPassword())) {
			throw new BadRequestException(INVALID_PASSWORD_FORMAT);
		}
	}

	private boolean isValidEmail(String email) {
		String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
		return Pattern.matches(emailRegex , email);
	}

	private boolean isValidLength(String value) {
		return StringUtils.hasText(value) && value.length() >= 2;
	}

	private boolean isValidPassword(String password) {
		String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$";
		return Pattern.matches(passwordRegex , password);
	}

	public Optional<User> findById(String userId) {
		return userRepository.findById(userId);
	}
}