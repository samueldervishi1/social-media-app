package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.models.ActivityModel.ActionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UpdatePassword {

	private static final Logger logger = LoggerFactory.getLogger(UpdatePassword.class);
	private static final String USER_NOT_FOUND = "User not found with username: %s";
	private static final String PASSWORD_UPDATED = "Password updated successfully";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ActivityService activityService;

	public UpdatePassword(UserRepository userRepository , PasswordEncoder passwordEncoder , ActivityService activityService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.activityService = activityService;
	}

	public void updatePassword(String username , String newPassword) {
		logger.info("Updating password for user: {}" , username);

		User user = getUserByUsername(username);
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);

		logPasswordUpdate(user);
		logger.info("Password successfully updated for user: {}" , username);
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> {
					logger.error("User not found with username: {}" , username);
					return new NotFoundException(String.format(USER_NOT_FOUND , username));
				});
	}

	private void logPasswordUpdate(User user) {
		String actionTypeString = user.getUsername() + " changed password";
		ActionType actionType = new ActionType(List.of(actionTypeString));
		activityService.updateOrCreateActivity(user.getId() , actionType , PASSWORD_UPDATED);
	}
}