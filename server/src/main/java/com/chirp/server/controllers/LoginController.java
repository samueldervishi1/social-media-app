package com.chirp.server.controllers;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Error;
import com.chirp.server.models.User;
import com.chirp.server.services.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

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

		if ((username == null || username.isEmpty()) && (password == null || password.isEmpty())) {
			return createErrorResponse(new CustomException(400 , "username or password is empty"));
		}

		if (username == null || username.isEmpty()) {
			return createErrorResponse(new CustomException(400 , "username is empty"));
		}

		if (password == null || password.isEmpty()) {
			return createErrorResponse(new CustomException(400 , "password is empty"));
		}

		try {
			String token = loginService.login(username , password);
			return createSuccessResponse(token);
		} catch (CustomException e) {
			return createErrorResponse(e);
		} catch (Exception e) {
			return createErrorResponse(new CustomException(500 , "An internal server error occurred"));
		}
	}

	private ResponseEntity<Map<String, String>> createSuccessResponse(String token) {
		Map<String, String> response = new HashMap<>();
		response.put("code" , "200");
		response.put("token" , token);
		return ResponseEntity.ok(response);
	}

	private ResponseEntity<Error> createErrorResponse(CustomException exception) {
		Error errorResponse = new Error();
		errorResponse.setCode(String.valueOf(exception.getCode()));
		errorResponse.setMessage(exception.getMessage());
		return ResponseEntity.status(exception.getCode()).body(errorResponse);
	}
}