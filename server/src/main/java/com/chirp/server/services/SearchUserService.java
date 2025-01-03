package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.models.ActivityModel.ActionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchUserService {

	private static final Logger logger = LoggerFactory.getLogger(SearchUserService.class);

	private final UserRepository userRepository;
	private final ActivityService activityService;

	public SearchUserService(UserRepository userRepository , ActivityService activityService) {
		this.userRepository = userRepository;
		this.activityService = activityService;
	}

	public List<User> searchUser(String username) {
		if (username == null || username.trim().isEmpty()) {
			logger.warn("Search request with null or empty username");
			throw new IllegalArgumentException("Username must not be empty or null.");
		}

		try {
			List<User> users = userRepository.findByUsernameContaining(username);

			List<User> activeUsers = users.stream()
					.filter(user -> !user.isDeleted())
					.collect(Collectors.toList());

			if (activeUsers.isEmpty()) {
				logger.info("No active users found for username: {}" , username);
				throw new NotFoundException("No users found.");
			}

			String actionTypeString = username + " searched for users";
			ActionType actionType = new ActionType(List.of(actionTypeString));

			String userId = activeUsers.get(0).getId();
			activityService.updateOrCreateActivity(userId , actionType , "Search completed successfully");

			return activeUsers;
		} catch (InternalServerErrorException e) {
			logger.error("Internal error while searching for user by username: {}. Error: {}" , username , e.getMessage());
			throw new InternalServerErrorException("Error searching for user by username");
		} catch (Exception e) {
			logger.error("Unexpected error while searching for user by username: {}. Error: {}" , username , e.getMessage());
			throw new InternalServerErrorException("Unexpected error occurred.");
		}
	}
}