package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.User;
import com.chirp.server.repositories.UserRepository;
import com.chirp.server.utils.JwtTokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
	private static final String USER_NOT_FOUND = "username is incorrect";
	private static final String USER_DELETED = "This user does not exist.";
	private static final String INVALID_CREDENTIALS = "password is incorrect";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenUtil jwtTokenUtil;

	public LoginService(UserRepository userRepository , PasswordEncoder passwordEncoder , JwtTokenUtil jwtTokenUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenUtil = jwtTokenUtil;
	}

	public String login(String username , String password) {
		User user = findAndValidateUser(username);
		validatePassword(password , user);

		return generateUserToken(user);
	}

	private User findAndValidateUser(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(404 , USER_NOT_FOUND));

		if (user.isDeleted()) {
			throw new CustomException(404 , USER_DELETED);
		}

		return user;
	}

	private void validatePassword(String rawPassword , User user) {
		if (!passwordEncoder.matches(rawPassword + user.getSalt() , user.getPassword())) {
			throw new CustomException(400 , INVALID_CREDENTIALS);
		}
	}


	private String generateUserToken(User user) {
		return jwtTokenUtil.generateToken(user.getUsername() , user.getId() , user.isTwoFa());
	}
}