package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private static final String DEFAULT_ROLE = "simple_account";
	private static final String INVALID_EMAIL_FORMAT = "Invalid email format";
	private static final String EMAIL_ALREADY_EXISTS = "Email already exists";
	private static final String USERNAME_ALREADY_EXISTS = "Username already exists";
	private static final String NAME_TOO_SHORT = "Full name should be at least 2 characters long";
	private static final String INVALID_PASSWORD_FORMAT = "Password should be at least 8 characters long, including one letter, one symbol, and one number";
	private static final String EMAIL_REGEX = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
	private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$";

	public UserService(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User createUser(User user) {
		validateUser(user);

		String salt = generateSalt();
		String saltedPassword = user.getPassword() + salt;
		String hashedPassword = passwordEncoder.encode(saltedPassword);

		user.setPassword(hashedPassword);
		user.setSalt(salt);
		user.setRole(user.getRole() != null ? user.getRole() : DEFAULT_ROLE);

		logger.info("Creating user: {}" , user.getUsername());
		return userRepository.save(user);
	}

	private String generateSalt() {
		byte[] saltBytes = new byte[16];
		SECURE_RANDOM.nextBytes(saltBytes);
		return Base64.getEncoder().encodeToString(saltBytes);
	}

	private void validateUser(User user) {
		if (user == null) {
			throw new BadRequestException("User cannot be null");
		}

		if (!isValidEmail(user.getEmail())) {
			throw new BadRequestException(INVALID_EMAIL_FORMAT);
		}

		boolean emailExists = userRepository.existsByEmail(user.getEmail());
		boolean usernameExists = userRepository.existsByUsername(user.getUsername());

		if (emailExists || usernameExists) {
			if (emailExists) {
				logger.error("Email already exists: {}" , user.getEmail());
				throw new BadRequestException(EMAIL_ALREADY_EXISTS);
			}
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

	public User getUserInfo(String username) {
		return userRepository.findByUsername(username).orElseThrow(() -> {
			logger.error("User not found with username: {}" , username);
			return new NotFoundException("User not found with username: " + username);
		});
	}

	public User getUserInfoById(String id) {
		return userRepository.findUserById(id).orElseThrow(() -> {
			logger.error("User not found with ID: {}" , id);
			return new NotFoundException("User not found with ID: " + id);
		});
	}

	public Optional<User> findById(String userId) {
		return userRepository.findById(userId);
	}

	public List<User> getAllUsers() {
		logger.info("Fetching all users from the database.");
		return userRepository.findAll();
	}

	private boolean isValidEmail(String email) {
		return Pattern.matches(EMAIL_REGEX , email);
	}

	private boolean isValidLength(String value) {
		return StringUtils.hasText(value) && value.length() >= 2;
	}

	private boolean isValidPassword(String password) {
		return Pattern.matches(PASSWORD_REGEX , password);
	}
}