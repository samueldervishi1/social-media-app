package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private static final String DEFAULT_ROLE = "simple_account";
	private static final String INVALID_EMAIL_FORMAT = "Invalid email format";
	private static final String EMAIL_ALREADY_EXISTS = "Email already exists";
	private static final String USERNAME_ALREADY_EXISTS = "Username already exists";
	private static final String NAME_TOO_SHORT = "Full name should be at least 2 characters long";
	private static final String INVALID_PASSWORD_FORMAT = "Password should be at least 8 characters long, including one letter, one symbol, and one number";
	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA5A-Z]{2,7}$");
	private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		logger.info("UserService initialized.");
	}

	public User createUser(User user) {
		logger.debug("Entering createUser method with user: {}" , user);

		validateUser(user);

		logger.debug("User validated successfully: {}" , user);

		user.setEmail(user.getEmail());
		user.setFullName(user.getFullName());

		String salt = generateSalt();
		logger.debug("Generated salt: {}" , salt);

		user.setPassword(passwordEncoder.encode(user.getPassword() + salt));
		user.setSalt(salt);
		user.setRole(user.getRole() == null ? DEFAULT_ROLE : user.getRole());
		user.setAccountCreationDate(LocalDateTime.now());

		logger.info("Creating user: {}" , user.getUsername());
		User createdUser = userRepository.save(user);
		logger.info("User created successfully: {}" , createdUser.getUsername());

		return createdUser;
	}

	private String generateSalt() {
		byte[] saltBytes = new byte[16];
		SECURE_RANDOM.nextBytes(saltBytes);
		String salt = Base64.getEncoder().encodeToString(saltBytes);
		logger.debug("Generated salt value: {}" , salt);
		return salt;
	}

	private void validateUser(User user) {
		logger.debug("Validating user: {}" , user);

		if (user == null) {
			logger.error("User cannot be null");
			throw new CustomException(400 , "User cannot be null");
		}

		if (!isValidEmail(user.getEmail())) {
			logger.error("Invalid email format: {}" , user.getEmail());
			throw new CustomException(400 , INVALID_EMAIL_FORMAT);
		}

		if (!isValidLength(user.getFullName())) {
			logger.error("Full name is too short: {}" , user.getFullName());
			throw new CustomException(400 , NAME_TOO_SHORT);
		}

		if (!isValidPassword(user.getPassword())) {
			logger.error("Invalid password format: {}" , user.getPassword());
			throw new CustomException(400 , INVALID_PASSWORD_FORMAT);
		}

		checkDuplicateCredentials(user);
	}

	private void checkDuplicateCredentials(User user) {
		logger.debug("Checking for duplicate credentials for email: {} and username: {}" , user.getEmail() , user.getUsername());

		if (userRepository.existsByEmail(user.getEmail())) {
			logger.error("Email already exists: {}" , user.getEmail());
			throw new CustomException(400 , EMAIL_ALREADY_EXISTS);
		}

		if (userRepository.existsByUsername(user.getUsername())) {
			logger.error("Username already exists: {}" , user.getUsername());
			throw new CustomException(400 , USERNAME_ALREADY_EXISTS);
		}

		logger.debug("No duplicate credentials found for user: {}" , user.getUsername());
	}

	public User getUserInfo(String username) {
		logger.debug("Fetching user info for username: {}" , username);

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> {
					logger.error("User not found with username: {}" , username);
					return new CustomException(404 , "User not found with username: " + username);
				});

		logger.debug("Fetched user info for username: {}" , username);
		return user;
	}

	public User getUserInfoById(String id) {
		logger.debug("Fetching user info by ID: {}" , id);

		User user = userRepository.findUserById(id)
				.orElseThrow(() -> {
					logger.error("User not found with ID: {}" , id);
					return new CustomException(404 , "User not found with ID: " + id);
				});

		logger.debug("Fetched user info for ID: {}" , id);
		return user;
	}

	public Optional<User> findById(String userId) {
		logger.debug("Fetching user by ID: {}" , userId);
		return userRepository.findById(userId);
	}

	public List<User> getAllUsers() {
		logger.info("Fetching all users from the database.");
		List<User> users = userRepository.findAll();
		logger.info("Fetched {} users from the database." , users.size());
		return users;
	}

	private boolean isValidEmail(String email) {
		boolean isValid = EMAIL_PATTERN.matcher(email).matches();
		logger.debug("Email {} is valid: {}" , email , isValid);
		return isValid;
	}

	private boolean isValidLength(String value) {
		boolean isValid = StringUtils.hasText(value) && value.length() >= 2;
		logger.debug("Full name {} is valid: {}" , value , isValid);
		return isValid;
	}

	private boolean isValidPassword(String password) {
		boolean isValid = PASSWORD_PATTERN.matcher(password).matches();
		logger.debug("Password {} is valid: {}" , password , isValid);
		return isValid;
	}
}