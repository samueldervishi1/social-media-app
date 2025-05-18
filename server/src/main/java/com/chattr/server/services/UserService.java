package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.chattr.server.models.Messages.*;

/**
 * Service for user data retrieval by username, ID, or all users.
 */
@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Fetches full user object by username or throws if not found.
	 *
	 * @param username target username
	 * @return matched User object
	 */
	public User getUserInfo(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(404 , String.format(USER_NOT_FOUND_BY_USERNAME , username)));
	}

	/**
	 * Retrieves username by user ID.
	 *
	 * @param userId target user ID
	 * @return username string
	 */
	public String getUsernameById(String userId) {
		return userRepository.findById(userId)
				.map(User::getUsername)
				.orElseThrow(() -> new CustomException(404 , String.format(USER_NOT_FOUND_BY_ID, userId)));
	}

	/**
	 * Returns a list of all users in the system.
	 */
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}
}