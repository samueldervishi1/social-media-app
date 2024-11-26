package com.chirp.server.controllers;

import com.chirp.server.services.UserService;
import com.chirp.server.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v2/auth")
public class AuthController {

	@Autowired
	private UserService userService;

	@GetMapping("/2fa-status/{userId}")
	public String checkTwoFaStatus(@PathVariable String userId) {
		User user = userService.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (Objects.equals(user.getTwoFa() , "active")) {
			return "redirect-to-2fa";
		} else {
			return "redirect-to-home";
		}
	}
}