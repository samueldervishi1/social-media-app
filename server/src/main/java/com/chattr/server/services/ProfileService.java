package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service responsible for user profile updates, password management,
 * and account state toggling (activate/deactivate/soft delete).
 */
@Service
public class ProfileService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private static final Logger LOGGER = LoggerFactory.getLogger(ProfileService.class);

	public ProfileService(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * Updates a user's profile fields such as bio, title, role, and email.
	 *
	 * @param userId      ID of the user to update
	 * @param updatedUser user object with updated fields
	 * @return updated User entity
	 */
	public User updateProfile(String userId , User updatedUser) {
		validateUserId(userId);
		User user = findUserById(userId);

		applyProfileChanges(user , updatedUser);
		User savedUser = userRepository.save(user);

		LOGGER.info("Profile updated for userId {}" , userId);
		return savedUser;
	}

	/**
	 * Updates the user's password after verifying the current one.
	 *
	 * @param userId      ID of the user
	 * @param oldPassword current password
	 * @param newPassword new password
	 */
	public void updatePassword(String userId , String oldPassword , String newPassword) {
		validateUserId(userId);
		User user = findUserById(userId);

		if (!passwordEncoder.matches(oldPassword , user.getPassword())) {
			LOGGER.warn("Password update failed for userId {}: incorrect old password" , userId);
			throw new CustomException(400 , "Old password is incorrect");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);

		LOGGER.info("Password updated successfully for userId {}" , userId);
	}

	/**
	 * Marks the user as deleted (soft delete).
	 *
	 * @param userId ID of the user to delete
	 */
	public void softDeleteUser(String userId) {
		toggleUserFlag(userId , true , false , null);
		LOGGER.info("User soft-deleted: userId {}" , userId);
	}

	/**
	 * Deactivates the user without deleting them.
	 *
	 * @param userId ID of the user to deactivate
	 */
	public void deactivateUser(String userId) {
		toggleUserFlag(userId , false , true , LocalDateTime.now());
		LOGGER.info("User deactivated: userId {}" , userId);
	}

	/**
	 * Reactivates a previously deactivated user.
	 *
	 * @param userId ID of the user to reactivate
	 */
	public void activateUser(String userId) {
		toggleUserFlag(userId , false , false , null);
		LOGGER.info("User reactivated: userId {}" , userId);
	}

	/**
	 * Applies individual profile field updates safely.
	 *
	 * @param user        the existing user entity
	 * @param updatedUser user object with new values
	 */
	private void applyProfileChanges(User user , User updatedUser) {
		Optional.ofNullable(updatedUser.getFullName()).ifPresent(user::setFullName);
		Optional.ofNullable(updatedUser.getBio()).ifPresent(user::setBio);
		Optional.ofNullable(updatedUser.getRole()).ifPresent(user::setRole);
		Optional.ofNullable(updatedUser.getTitle()).ifPresent(user::setTitle);
		Optional.ofNullable(updatedUser.getEmail()).ifPresent(user::setEmail);
		user.setTwoFa(updatedUser.isTwoFa());
	}

	/**
	 * General-purpose method to toggle flags like deleted, deactivated, and deactivationTime.
	 *
	 * @param userId           the ID of the user
	 * @param deleted          whether to mark as deleted
	 * @param deactivated      whether to mark as deactivated
	 * @param deactivationTime optional timestamp for deactivation
	 */
	private void toggleUserFlag(String userId , boolean deleted , boolean deactivated , LocalDateTime deactivationTime) {
		validateUserId(userId);
		User user = findUserById(userId);

		user.setDeleted(deleted);
		user.setDeactivated(deactivated);
		user.setDeactivationTime(deactivationTime);

		userRepository.save(user);
	}

	/**
	 * Finds a user by ID or throws a not-found exception.
	 *
	 * @param userId ID of the user
	 * @return found User entity
	 */
	private User findUserById(String userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> {
					LOGGER.warn("User not found with ID: {}" , userId);
					return new CustomException(404 , String.format(Messages.USER_NOT_FOUND_BY_ID , userId));
				});
	}

	/**
	 * Ensures the userId is not null or empty.
	 *
	 * @param userId input string to validate
	 */
	private void validateUserId(String userId) {
		if (userId == null || userId.isBlank()) {
			LOGGER.error("Provided userId is null or blank");
			throw new IllegalArgumentException(Messages.USER_ID_ERROR);
		}
	}
}