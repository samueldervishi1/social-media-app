package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
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

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public User updateProfile(String userId , User updatedUser) throws Exception {
		try {
			User user = findUserById(userId);

			Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
			Optional.ofNullable(updatedUser.getTwoFa()).ifPresent(user::setTwoFa);
			updateFields(user , updatedUser);

			User updatedUserRecord = userRepository.save(user);
			logger.info("User updated successfully: {}" , user.getId());
			return updatedUserRecord;

		} catch (Exception e) {
			return handleException("updating profile" , userId , e);
		}
	}

	public void updatePassword(String userId , String oldPassword , String newPassword) throws Exception {
		try {
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
			User user = findUserById(userId);
			user.setDeleted(true);

			userRepository.save(user);
			logger.info("User deleted for user ID: {}" , userId);
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
		}
	}

	private void updateFields(User user , User updatedUser) {
		Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
		Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
		Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
		Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
		Optional.ofNullable(updatedUser.getTwoFa()).ifPresent(user::setTwoFa);

		updateLinks(user , updatedUser.getLinks());
	}

	private User findUserById(String userId) {
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
