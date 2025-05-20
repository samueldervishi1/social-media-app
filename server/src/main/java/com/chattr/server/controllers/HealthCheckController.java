package com.chattr.server.controllers;

import com.chattr.server.models.HealthLog;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.HealthLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for checking and logging system health status.
 */
@RestController
@RequestMapping("/health")
public class HealthCheckController {

    private final HealthLogService healthLogService;
    private final ActivityLogService activityLogService;

    /**
     * Constructor for injecting the health log service.
     *
     * @param healthLogService the service handling health check persistence and retrieval
     */
    public HealthCheckController(HealthLogService healthLogService, ActivityLogService activityLogService) {
        this.healthLogService = healthLogService;
        this.activityLogService = activityLogService;
    }

    /**
     * Endpoint to get the latest system health status.
     * If no prior entry exists, a default health status is assumed and logged.
     *
     * @return response entity with health status and timestamp
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        HealthLog.HealthEntry lastEntry = healthLogService.getLastHealthEntry();

        if (lastEntry != null) {
            // Use the most recent health log
            response.put("status", lastEntry.getStatus());
            response.put("timestamp", lastEntry.getTimestamp());
        } else {
            // No previous health entry found, log a default one
            String defaultStatus = "All systems operational";
            LocalDateTime now = LocalDateTime.now();

            response.put("status", defaultStatus);
            response.put("timestamp", now);

            healthLogService.saveHealthCheck(defaultStatus);
        }

        activityLogService.log("anonymous", "HEALTH_CHECK", "Health check performed");
        return ResponseEntity.ok(response);
    }
}