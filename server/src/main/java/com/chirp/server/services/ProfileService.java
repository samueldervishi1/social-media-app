package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
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

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ActivityService activityService;

	@Autowired
	public ProfileService(UserRepository userRepository , PasswordEncoder passwordEncoder , ActivityService activityService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.activityService = activityService;
	}

	public User updateProfile(String userId , User updatedUser) throws Exception {
		try {
			if (userId == null || userId.isEmpty()) {
				throw new IllegalArgumentException("User ID cannot be null or empty");
			}

			logger.info("Updating profile for user ID: {}" , userId);
			logger.info("Received updated user details: {}" , updatedUser);

			User user = findUserById(userId);

			Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
			user.setTwoFa(updatedUser.isTwoFa());
			updateFields(user , updatedUser);

			User updatedUserRecord = userRepository.save(user);

			activityService.updateOrCreateActivity(userId , new ActivityModel.ActionType(List.of("Updated profile")) , "Profile updated successfully");

			logger.info("User updated successfully: {}" , user.getId());
			return updatedUserRecord;

		} catch (Exception e) {
			return handleException("updating profile" , userId , e);
		}
	}

	public void updatePassword(String userId , String oldPassword , String newPassword) throws Exception {
		try {
			if (userId == null || userId.isEmpty()) {
				throw new IllegalArgumentException("User ID cannot be null or empty");
			}

			User user = findUserById(userId);

			if (!passwordEncoder.matches(oldPassword , user.getPassword())) {
				throw new IllegalArgumentException("Old password is incorrect");
			}

			user.setPassword(passwordEncoder.encode(newPassword));
			userRepository.save(user);

			logger.info("Password updated successfully for user ID: {}" , userId);

		} catch (Exception e) {
			handleException("updating password" , userId , e);
		}
	}

	public void softDeleteUser(String userId) throws Exception {
		try {
			if (userId == null || userId.isEmpty()) {
				throw new IllegalArgumentException("User ID cannot be null or empty");
			}

			User user = findUserById(userId);
			user.setDeleted(true);

			userRepository.save(user);

			logger.info("User soft deleted for user ID: {}" , userId);
		} catch (Exception e) {
			handleException("soft deleting user" , userId , e);
		}
	}

	private void updateLinks(User user , List<String> newLinks) {
		if (newLinks != null && !newLinks.isEmpty()) {
			List<String> filteredNewLinks = newLinks.stream()
					.filter(link -> link != null && !link.trim().isEmpty())
					.map(String::toLowerCase)
					.distinct()
					.toList();

			user.getLinks().clear();
			user.getLinks().addAll(filteredNewLinks);

			logger.info("User links updated for user ID: {}" , user.getId());
		}
	}

	private void updateFields(User user , User updatedUser) {
		Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
		Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
		Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
		Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
		user.setTwoFa(updatedUser.isTwoFa());

		updateLinks(user , updatedUser.getLinks());

		logger.info("Fields updated for user ID: {}" , user.getId());
	}

	private User findUserById(String userId) {
		if (userId == null || userId.isEmpty()) {
			throw new IllegalArgumentException("User ID cannot be null or empty");
		}

		logger.info("Fetching user by ID: {}" , userId);
		return userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
	}

	private User handleException(String action , String userId , Exception e) throws Exception {
		if (e instanceof NotFoundException || e instanceof IllegalArgumentException) {
			logger.error("{} failed: {}" , action , e.getMessage());
			throw e;
		} else {
			logger.error("Unexpected error occurred while {} for user ID {}: {}" , action , userId , e.getMessage());
			throw new InternalServerErrorException("Error " + action);
		}
	}
}