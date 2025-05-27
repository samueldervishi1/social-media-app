package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.UserRepository;
import com.chattr.server.utils.JwtTokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service responsible for handling user login, validation, and session generation.
 */
@Service
public class LoginService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenUtil jwtTokenUtil;
	private final EmailService emailService;
	private final AchievementService achievementService;

	public LoginService(UserRepository userRepository , PasswordEncoder passwordEncoder ,
	                    JwtTokenUtil jwtTokenUtil , EmailService emailService , AchievementService achievementService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenUtil = jwtTokenUtil;
		this.emailService = emailService;
		this.achievementService = achievementService;
	}

	public String login(String username , String password , String ipAddress) {
		User user = findAndValidateUser(username);

		verifyPassword(password , user);

		if (ipChanged(user.getLastLoginIp() , ipAddress)) {
			emailService.sendSecurityAlert(user.getEmail() , ipAddress);
		}

		updateLoginMetadata(user , ipAddress);
		achievementService.evaluateAchievements(user);
		userRepository.save(user);

		return jwtTokenUtil.generateToken(user.getUsername() , user.getId() , user.isTwoFa());
	}

	private User findAndValidateUser(String username) {
		return userRepository.findByUsername(username)
				.filter(user -> !user.isDeleted())
				.orElseThrow(() -> new CustomException(401 , Messages.INVALID_CREDENTIALS));
	}

	private void verifyPassword(String rawPassword , User user) {
		if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
			throw new CustomException(401 , Messages.INVALID_CREDENTIALS);
		}
	}

	private boolean ipChanged(String lastIp , String currentIp) {
		return lastIp == null || !lastIp.equals(currentIp);
	}

	private void updateLoginMetadata(User user , String ipAddress) {
		if (user.getFirstTimeLoggedIn() == null) {
			user.setFirstTimeLoggedIn(LocalDateTime.now());
			user.setLoginStreak(1);
		}
		user.setLastLoginIp(ipAddress);
		user.setLastLoginTime(LocalDateTime.now());
	}
}