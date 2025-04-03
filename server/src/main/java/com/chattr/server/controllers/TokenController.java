package com.chattr.server.controllers;

import com.chattr.server.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/internal")
public class TokenController {

	private final JwtTokenUtil jwtTokenUtil;

	@Value("${internal.client.id}")
	private String validClientId;

	@Value("${internal.client.secret}")
	private String validClientSecret;

	public TokenController(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@PostMapping("/token")
	public ResponseEntity<?> generateToken(
			@RequestParam("client_id") String clientId ,
			@RequestParam("client_secret") String clientSecret
	) {
		System.out.println("🔥 client_id: " + clientId + " / client_secret: " + clientSecret);

		if (!validClientId.equals(clientId) || !validClientSecret.equals(clientSecret)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid client credentials");
		}

		String accessToken = jwtTokenUtil.generateToken("internalService" , "internalServiceId" , false);
		String refreshToken = jwtTokenUtil.generateRefreshToken("internalService" , "internalServiceId" , false);

		Map<String, String> tokens = new HashMap<>();
		tokens.put("access_token" , accessToken);
		tokens.put("refresh_token" , refreshToken);
		return ResponseEntity.ok(tokens);
	}

}