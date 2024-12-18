package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchUserService {

	private static final Logger logger = LoggerFactory.getLogger(SearchUserService.class);

	private final UserRepository userRepository;

	public SearchUserService(UserRepository userRepository) {
		this.userRepository = userRepository;
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