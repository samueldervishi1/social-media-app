package com.chirp.server.controllers;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.models.User;
import com.chirp.server.services.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v2/auth")
public class LoginController {

	private final LoginService loginService;

	public LoginController(LoginService loginService) {
		this.loginService = loginService;
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody User user) {
		String username = user.getUsername();
		String password = user.getPassword();

		try {
			if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
				throw new BadRequestException("Username and password cannot be empty.");
			}

			String token = loginService.login(username , password);
			return ResponseEntity.ok(token);
		} catch (BadRequestException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(500).body("An unexpected error occurred.");
		}
	}
}