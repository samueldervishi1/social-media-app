package com.server.server.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

	@GetMapping
	public ResponseEntity<Map<String, Object>> checkHealth() {
		Map<String, Object> response = new HashMap<>();

		String statusMessage = "All systems operational";

		response.put("status" , statusMessage);
		response.put("timestamp" , LocalDateTime.now().toString());

		return ResponseEntity.ok(response);
	}
}