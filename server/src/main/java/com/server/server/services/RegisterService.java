package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.User;
import com.server.server.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.regex.Pattern;

@Slf4j
@Service
public class RegisterService {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private static final String DEFAULT_ROLE = "simple_account";
	private static final String INVALID_EMAIL_FORMAT = "Invalid email format";
	private static final String EMAIL_ALREADY_EXISTS = "Email already exists";
	private static final String USERNAME_ALREADY_EXISTS = "Username already exists";
	private static final String NAME_TOO_SHORT = "Full name should be at least 2 characters long";
	private static final String INVALID_PASSWORD_FORMAT = "Password should be at least 8 characters long, including one letter, one symbol, and one number";
	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
	private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public RegisterService(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public void createUser(User user) {
		validateUser(user);
		user.setEmail(user.getEmail());
		user.setFullName(user.getFullName());

		String salt = generateSalt();
		user.setPassword(passwordEncoder.encode(user.getPassword() + salt));
		user.setSalt(salt);
		user.setRole(user.getRole() == null ? DEFAULT_ROLE : user.getRole());
		user.setAccountCreationDate(LocalDateTime.now());
		userRepository.save(user);
	}

	private String generateSalt() {
		byte[] saltBytes = new byte[16];
		SECURE_RANDOM.nextBytes(saltBytes);
		return Base64.getEncoder().encodeToString(saltBytes);
	}

	private void validateUser(User user) {
		if (user == null) {
			throw new CustomException(400 , "User cannot be null");
		}
		if (!isValidEmail(user.getEmail())) {
			throw new CustomException(400 , INVALID_EMAIL_FORMAT);
		}
		if (!isValidLength(user.getFullName())) {
			throw new CustomException(400 , NAME_TOO_SHORT);
		}
		if (!isValidPassword(user.getPassword())) {
			throw new CustomException(400 , INVALID_PASSWORD_FORMAT);
		}
		checkDuplicateCredentials(user);
	}

	private void checkDuplicateCredentials(User user) {
		if (userRepository.existsByEmail(user.getEmail())) {
			throw new CustomException(400 , EMAIL_ALREADY_EXISTS);
		}
		if (userRepository.existsByUsername(user.getUsername())) {
			throw new CustomException(400 , USERNAME_ALREADY_EXISTS);
		}
	}

	private boolean isValidEmail(String email) {
		return EMAIL_PATTERN.matcher(email).matches();
	}

	private boolean isValidLength(String value) {
		return StringUtils.hasText(value) && value.length() >= 2;
	}

	private boolean isValidPassword(String password) {
		return PASSWORD_PATTERN.matcher(password).matches();
	}
}
