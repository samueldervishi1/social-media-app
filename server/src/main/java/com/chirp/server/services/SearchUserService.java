package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchUserService {

	@Autowired
	private UserRepository userRepository;

	public List<User> searchUser(String username) {
		try {
			return userRepository.findByUsernameContaining(username);
		} catch (Exception e) {
			System.err.println("Error searching for user by username: " + e.getMessage());
			throw new InternalServerErrorException("Error searching for user by username");
		}
	}
}
