package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.User;
import com.server.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User getUserInfo(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(404 , "User not found with username: " + username));
	}

	public String getUsernameById(String userId) {
		return userRepository.findById(userId)
				.map(User::getUsername)
				.orElseThrow(() -> new CustomException(404, "User not found"));
	}

	public List<User> getAllUsers() {
		return userRepository.findAll();
	}
}