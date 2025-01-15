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
	private static final String EMPTY_USERNAME_ERROR = "Username must not be empty or null.";
	private static final String NO_USERS_FOUND_ERROR = "No users found.";
	private static final String INTERNAL_ERROR = "Error searching for user by username";
	private static final String UNEXPECTED_ERROR = "Unexpected error occurred.";

	private final UserRepository userRepository;
	private final ActivityService activityService;

	public SearchUserService(UserRepository userRepository , ActivityService activityService) {
		this.userRepository = userRepository;
		this.activityService = activityService;
	}

	public List<User> searchUser(String username) {
		validateUsername(username);

		try {
			List<User> activeUsers = findActiveUsersByUsername(username);
			logSearchActivity(username , activeUsers);
			return activeUsers;
		} catch (InternalServerErrorException e) {
			logger.error("Internal error while searching for user by username: {}" , username , e);
			throw new InternalServerErrorException(INTERNAL_ERROR);
		} catch (Exception e) {
			logger.error("Unexpected error while searching for user by username: {}" , username , e);
			throw new InternalServerErrorException(UNEXPECTED_ERROR);
		}
	}

	private void validateUsername(String username) {
		if (username == null || username.trim().isEmpty()) {
			logger.warn("Search request with null or empty username");
			throw new IllegalArgumentException(EMPTY_USERNAME_ERROR);
		}
	}

	private List<User> findActiveUsersByUsername(String username) {
		List<User> activeUsers = userRepository.findByUsernameContaining(username).stream()
				.filter(user -> !user.isDeleted())
				.collect(Collectors.toList());

		if (activeUsers.isEmpty()) {
			logger.info("No active users found for username: {}" , username);
			throw new NotFoundException(NO_USERS_FOUND_ERROR);
		}

		return activeUsers;
	}

	private void logSearchActivity(String username , List<User> activeUsers) {
		String actionTypeString = username + " searched for users";
		ActionType actionType = new ActionType(List.of(actionTypeString));
		String userId = activeUsers.get(0).getId();
		activityService.updateOrCreateActivity(userId , actionType , "Search completed successfully");
	}
}