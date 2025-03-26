package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.User;
import com.server.server.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
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

	public User getUserInfoById(String id) {
		return userRepository.findUserById(id)
				.orElseThrow(() -> new CustomException(404 , "User not found with ID: " + id));
	}

	public List<User> getAllUsers() {
		return userRepository.findAll();
	}
}