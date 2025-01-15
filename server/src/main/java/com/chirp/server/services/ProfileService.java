package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

	private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);
	private static final String USER_ID_ERROR = "User ID cannot be null or empty";
	private static final String USER_NOT_FOUND = "User not found with ID: ";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ActivityService activityService;

	@Autowired
	public ProfileService(UserRepository userRepository , PasswordEncoder passwordEncoder , ActivityService activityService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.activityService = activityService;
	}

	public User updateProfile(String userId , User updatedUser) {
		validateUserId(userId);
		logger.info("Updating profile for user ID: {}" , userId);
		logger.debug("Received updated user details: {}" , updatedUser);

		User user = findUserById(userId);
		updateUserFields(user , updatedUser);
		User updatedUserRecord = userRepository.save(user);

		activityService.updateOrCreateActivity(
				userId ,
				new ActivityModel.ActionType(List.of("Updated profile")) ,
				"Profile updated successfully"
		);

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

	private void updateLinks(User user , List<String> newLinks) {
		if (newLinks == null || newLinks.isEmpty()) {
			return;
		}

		List<String> filteredNewLinks = newLinks.stream()
				.filter(link -> link != null && !link.trim().isEmpty())
				.map(String::toLowerCase)
				.distinct()
				.toList();

		user.getLinks().clear();
		user.getLinks().addAll(filteredNewLinks);
		logger.debug("User links updated for user ID: {}" , user.getId());
	}

	private void updateUserFields(User user , User updatedUser) {
		Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
		Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
		Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
		Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
		Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
		user.setTwoFa(updatedUser.isTwoFa());
		updateLinks(user , updatedUser.getLinks());
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