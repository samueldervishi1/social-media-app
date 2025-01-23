package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

	private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);
	private static final String USER_ID_ERROR = "User ID cannot be null or empty";
	private static final String USER_NOT_FOUND = "User not found with ID: ";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Autowired
	public ProfileService(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User updateProfile(String userId , User updatedUser) {
		validateUserId(userId);
		logger.info("Updating profile for user ID: {}" , userId);
		logger.debug("Received updated user details: {}" , updatedUser);

		User user = findUserById(userId);
		updateUserFields(user , updatedUser);
		User updatedUserRecord = userRepository.save(user);

		logger.info("User updated successfully: {}" , user.getId());
		return updatedUserRecord;
	}

	public void updatePassword(String userId , String oldPassword , String newPassword) {
		validateUserId(userId);
		User user = findUserById(userId);

		if (!passwordEncoder.matches(oldPassword , user.getPassword())) {
			throw new IllegalArgumentException("Old password is incorrect");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
		logger.info("Password updated successfully for user ID: {}" , userId);
	}

	public void softDeleteUser(String userId) {
		validateUserId(userId);
		User user = findUserById(userId);
		user.setDeleted(true);
		userRepository.save(user);
		logger.info("User soft deleted for user ID: {}" , userId);
	}

	private void updateUserFields(User user , User updatedUser) {
		Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
		Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
		Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
		Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
		Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
		user.setTwoFa(updatedUser.isTwoFa());
		logger.debug("Fields updated for user ID: {}" , user.getId());
	}

	private User findUserById(String userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException(USER_NOT_FOUND + userId));
	}

	private void validateUserId(String userId) {
		if (userId == null || userId.isEmpty()) {
			throw new IllegalArgumentException(USER_ID_ERROR);
		}
	}
}