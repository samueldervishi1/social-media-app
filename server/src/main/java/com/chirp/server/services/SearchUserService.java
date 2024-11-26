package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchUserService {

	private static final Logger logger = LoggerFactory.getLogger(SearchUserService.class);

	@Autowired
	private UserRepository userRepository;

	public List<User> searchUser(String username) {
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
		} catch (Exception e) {
			logger.error("Error searching for user by username: {}" , e.getMessage());
			throw new InternalServerErrorException("Error searching for user by username");
		}
	}
}