package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.models.ActivityModel.ActionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UpdatePassword {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ActivityService activityService;

	@Autowired
	public UpdatePassword(UserRepository userRepository , PasswordEncoder passwordEncoder , ActivityService activityService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.activityService = activityService;
	}

	public void updatePassword(String username , String newPassword) {
		User user = getUserByUsername(username);
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);

		String actionTypeString = username + " changed password";
		ActionType actionType = new ActionType(List.of(actionTypeString));
		activityService.updateOrCreateActivity(user.getId() , actionType , "Password updated successfully");
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User not found with username: " + username));
	}
}