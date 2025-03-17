package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Cacheable(value = "users", key = "#username", unless = "#result == null")
	public User getUserInfo(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(404 , "User not found with username: " + username));
	}

	@Cacheable(value = "users", key = "#id", unless = "#result == null")
	public User getUserInfoById(String id) {
		return userRepository.findUserById(id)
				.orElseThrow(() -> new CustomException(404 , "User not found with ID: " + id));
	}

	@Cacheable(value = "users", key = "'all'", unless = "#result.isEmpty()")
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}
}