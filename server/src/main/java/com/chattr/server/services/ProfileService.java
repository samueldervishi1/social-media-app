package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
		return userRepository.save(user);
	}

	/**
	 * Updates the user's password after verifying the current one.
	 */
	public void updatePassword(String userId , String oldPassword , String newPassword) {
		validateUserId(userId);
		User user = findUserById(userId);

		if (!passwordEncoder.matches(oldPassword , user.getPassword())) {
			throw new CustomException(400 , "Old password is incorrect");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	/**
	 * Marks the user as deleted (soft delete).
	 */
	public void softDeleteUser(String userId) {
		toggleUserFlag(userId , true , false , null);
	}

	/**
	 * Deactivates the user without deleting them.
	 */
	public void deactivateUser(String userId) {
		toggleUserFlag(userId , false , true , LocalDateTime.now());
	}

	/**
	 * Reactivates a previously deactivated user.
	 */
	public void activateUser(String userId) {
		toggleUserFlag(userId , false , false , null);
	}

	/**
	 * Applies individual profile field updates safely.
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
	 */
	private User findUserById(String userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new CustomException(404 , String.format(Messages.USER_NOT_FOUND_BY_ID , userId)));
	}

	/**
	 * Ensures the userId is not null or empty.
	 */
	private void validateUserId(String userId) {
		if (userId == null || userId.isBlank()) {
			throw new IllegalArgumentException(Messages.USER_ID_ERROR);
		}
	}
}