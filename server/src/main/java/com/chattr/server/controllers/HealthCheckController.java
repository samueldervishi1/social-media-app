package com.chattr.server.controllers;

import com.chattr.server.services.HealthLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

	private final HealthLogService  healthLogService;

	public HealthCheckController(HealthLogService healthLogService) {
		this.healthLogService = healthLogService;
	}

	@GetMapping
	public ResponseEntity<Map<String, Object>> checkHealth() {
		Map<String, Object> response = new HashMap<>();

		String statusMessage = "All systems operational";

		response.put("status" , statusMessage);
		response.put("timestamp" , LocalDateTime.now().toString());

		healthLogService.saveHealthCheck(statusMessage);
		return ResponseEntity.ok(response);
	}
}