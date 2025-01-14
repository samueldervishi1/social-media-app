package com.chirp.server.controllers;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.ResourceNotFoundException;
import com.chirp.server.services.UserService;
import com.chirp.server.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestMapping;

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
					.orElseThrow(() -> new ResourceNotFoundException("User not found"));

			if (user.isTwoFa()) {
				return "redirect-to-2fa";
			} else {
				return "redirect-to-home";
			}
		} catch (InternalServerErrorException e) {
			logger.error("Error generating JWT token for userId: {}: {}" , userId , e.getMessage());
			throw new InternalServerErrorException("Error generating JWT token");
		}
	}
}