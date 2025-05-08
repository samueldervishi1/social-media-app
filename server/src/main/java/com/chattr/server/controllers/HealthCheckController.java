package com.chattr.server.controllers;

import com.chattr.server.models.HealthLog;
import com.chattr.server.services.HealthLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

    private final HealthLogService healthLogService;

    public HealthCheckController(HealthLogService healthLogService) {
        this.healthLogService = healthLogService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        HealthLog.HealthEntry lastEntry = healthLogService.getLastHealthEntry();

        if (lastEntry != null) {
            response.put("status", lastEntry.getStatus());
            response.put("timestamp", lastEntry.getTimestamp());
        } else {
            String defaultStatus = "All systems operational";
            response.put("status", defaultStatus);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            healthLogService.saveHealthCheck(defaultStatus);
        }

        return ResponseEntity.ok(response);
    }
}