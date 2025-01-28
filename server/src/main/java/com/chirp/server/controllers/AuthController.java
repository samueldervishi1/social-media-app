package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.services.UserService;
import com.chirp.server.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v2/auth")
public class AuthController {

	private final UserService userService;
	private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/2fa-status/{userId}")
	public String checkTwoFaStatus(@PathVariable String userId) {
		try {
			User user = userService.findById(userId)
					.orElseThrow(() -> new CustomException(404 , "User not found"));

			return user.isTwoFa() ? "redirect-to-2fa" : "redirect-to-home";
		} catch (Exception e) {
			logger.error("Error processing 2FA status for userId: {}: {}" , userId , e.getMessage());
			throw new CustomException(500 , "Internal server error");
		}
	}
}