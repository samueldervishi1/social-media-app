package com.chirp.server.controllers;

import com.chirp.server.services.UserService;
import com.chirp.server.models.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v2/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService){
		this.userService = userService;
	}

	@GetMapping("/2fa-status/{userId}")
	public String checkTwoFaStatus(@PathVariable String userId) {
		User user = userService.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (user.isTwoFa()) {
			return "redirect-to-2fa";
		} else {
			return "redirect-to-home";
		}
	}
}