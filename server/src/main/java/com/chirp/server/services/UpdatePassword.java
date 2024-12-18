package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UpdatePassword {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UpdatePassword(UserRepository userRepository , PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}


	public void updatePassword(String username , String newPassword) {
		User user = getUserByUsername(username);
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User not found with username: " + username));
	}
}