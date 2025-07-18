package com.chattr.server.controllers;

import com.chattr.server.models.HealthLog;
import com.chattr.server.services.HealthLogService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for checking and logging system health status. */
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

        try {
            boolean isHealthy = performHealthChecks();

            HealthLog.HealthEntry lastEntry = healthLogService.getLastHealthEntry();

            if (lastEntry != null) {
                response.put("status", lastEntry.getStatus());
                response.put("timestamp", lastEntry.getTimestamp());
            } else {
                String defaultStatus = isHealthy ? "All systems operational" : "System health unknown";
                LocalDateTime now = LocalDateTime.now();

                response.put("status", defaultStatus);
                response.put("timestamp", now);

                healthLogService.saveHealthCheck(defaultStatus);
            }

            response.put("healthy", isHealthy);
            response.put("service", "chattr-server");
            response.put("version", "1.3.2");

            if (isHealthy) {
                response.put("code", 200);
                return ResponseEntity.ok(response);
            } else {
                response.put("code", 503);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }

        } catch (Exception e) {
            response.put("status", "Health check failed");
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            response.put("healthy", false);
            response.put("code", 500);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private boolean performHealthChecks() {
        try {
            return isDatabaseHealthy() && isMemoryHealthy() && isDiskSpaceHealthy();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isDatabaseHealthy() {
        try {
            healthLogService.getLastHealthEntry();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isMemoryHealthy() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();

        return (usedMemory * 100) < (maxMemory * 85);
    }

    private boolean isDiskSpaceHealthy() {
        try {
            java.io.File root = new java.io.File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();

            return (freeSpace * 100) > (totalSpace * 10);
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> checks = new HashMap<>();

        try {
            boolean dbHealthy = isDatabaseHealthy();
            checks.put("database", createCheckResult(dbHealthy, "Database connectivity"));

            boolean memoryHealthy = isMemoryHealthy();
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

            Map<String, Object> memoryDetails = createCheckResult(memoryHealthy, "Memory usage");
            memoryDetails.put("usage_percent", Math.round(memoryUsagePercent * 100.0) / 100.0);
            memoryDetails.put("max_memory_mb", maxMemory / 1024 / 1024);
            memoryDetails.put("used_memory_mb", usedMemory / 1024 / 1024);
            checks.put("memory", memoryDetails);

            boolean diskHealthy = isDiskSpaceHealthy();
            checks.put("disk_space", createCheckResult(diskHealthy, "Disk space availability"));

            boolean overallHealthy = dbHealthy && memoryHealthy && diskHealthy;

            response.put("status", overallHealthy ? "All systems operational" : "Some systems degraded");
            response.put("healthy", overallHealthy);
            response.put("timestamp", LocalDateTime.now());
            response.put("checks", checks);
            response.put("service", "chattr-server");
            response.put("version", "1.3.2");

            if (overallHealthy) {
                response.put("code", 200);
                return ResponseEntity.ok(response);
            } else {
                response.put("code", 503);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }

        } catch (Exception e) {
            response.put("status", "Health check failed");
            response.put("error", e.getMessage());
            response.put("healthy", false);
            response.put("timestamp", LocalDateTime.now());
            response.put("code", 500);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, Object> createCheckResult(boolean healthy, String description) {
        Map<String, Object> result = new HashMap<>();
        result.put("healthy", healthy);
        result.put("status", healthy ? "UP" : "DOWN");
        result.put("description", description);
        return result;
    }
}
