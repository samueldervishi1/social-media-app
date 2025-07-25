package com.chattr.server.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for comprehensive logging of all application activities. Stores logs
 * locally in JSON format for easy parsing and analysis.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoggingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String LOG_DIR = "logs/";
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void logInfo(String service, String method, String message) {
        logEvent("INFO", service, method, message, null, null);
    }

    public void logWarn(String service, String method, String message) {
        logEvent("WARN", service, method, message, null, null);
    }

    public void logError(String service, String method, String message, Exception exception) {
        logEvent("ERROR", service, method, message, null, exception);
    }

    public void logError(String service, String method, String message, Object data, Exception exception) {
        logEvent("ERROR", service, method, message, data, exception);
    }

    public void logDebug(String service, String method, String message) {
        logEvent("DEBUG", service, method, message, null, null);
    }

    public void logExecutionTime(String service, String method, long executionTimeMs) {
        Map<String, Object> data = new HashMap<>();
        data.put("executionTimeMs", executionTimeMs);
        data.put("performanceFlag", executionTimeMs > 1000 ? "SLOW" : "NORMAL");

        logEvent("PERF", service, method, String.format("Method executed in %dms", executionTimeMs), data, null);
    }

    @Async
    public void logEvent(String level, String service, String method, String message, Object data,
            Exception exception) {
        CompletableFuture.runAsync(() -> {
            try {
                Map<String, Object> logEntry = createLogEntry(level, service, method, message, data, exception);

                logToConsole(level, logEntry);

                storeToFile(logEntry);

            } catch (Exception e) {
                log.error("Failed to write log entry", e);
            }
        });
    }

    private Map<String, Object> createLogEntry(String level, String service, String method, String message, Object data,
            Exception exception) {
        Map<String, Object> logEntry = new HashMap<>();

        logEntry.put("timestamp", LocalDateTime.now().format(TIMESTAMP_FORMAT));
        logEntry.put("level", level);
        logEntry.put("service", service);
        logEntry.put("method", method);
        logEntry.put("message", message);
        logEntry.put("thread", Thread.currentThread().getName());

        if (data != null) {
            logEntry.put("data", data);
        }

        if (exception != null) {
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("exceptionClass", exception.getClass().getSimpleName());
            errorDetails.put("exceptionMessage", exception.getMessage());
            errorDetails.put("stackTrace", getStackTrace(exception));
            logEntry.put("exception", errorDetails);
        }

        return logEntry;
    }

    private void logToConsole(String level, Map<String, Object> logEntry) {
        String message = String.format("[%s.%s] %s", logEntry.get("service"), logEntry.get("method"),
                logEntry.get("message"));

        switch (level) {
            case "ERROR" :
                log.error(message);
                break;
            case "WARN" :
                log.warn(message);
                break;
            case "INFO" :
                log.info(message);
                break;
            case "DEBUG" :
                log.debug(message);
                break;
            case "PERF" :
                log.info("[PERFORMANCE] {}", message);
                break;
            default :
                log.info(message);
        }
    }

    private void storeToFile(Map<String, Object> logEntry) {
        try {
            String today = LocalDateTime.now().format(FILE_DATE_FORMAT);
            String fileName = LOG_DIR + "app-" + today + ".log";

            java.io.File directory = new java.io.File(LOG_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            try (FileWriter writer = new FileWriter(fileName, true)) {
                writer.write(objectMapper.writeValueAsString(logEntry) + "\n");
            }

        } catch (IOException e) {
            log.error("Failed to write to log file", e);
        }
    }

    private String getStackTrace(Exception exception) {
        java.io.StringWriter sw = new java.io.StringWriter();
        exception.printStackTrace(new java.io.PrintWriter(sw));
        return sw.toString();
    }

    public void logUserActivity(String userId, String username, String activity, String ipAddress) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("username", username);
        data.put("ipAddress", ipAddress);

        logEvent("USER_ACTIVITY", "UserActivity", activity, String.format("User %s performed: %s", username, activity),
                data, null);
    }

    public void logApiRequest(String endpoint, String method, String userAgent, String ipAddress, long responseTimeMs,
            int statusCode) {
        Map<String, Object> data = new HashMap<>();
        data.put("endpoint", endpoint);
        data.put("httpMethod", method);
        data.put("userAgent", userAgent);
        data.put("ipAddress", ipAddress);
        data.put("responseTimeMs", responseTimeMs);
        data.put("statusCode", statusCode);

        String level = statusCode >= 400 ? "WARN" : "INFO";
        logEvent(level, "ApiRequest", endpoint,
                String.format("%s %s - %d (%dms)", method, endpoint, statusCode, responseTimeMs), data, null);
    }

    public void logSecurityEvent(String event, String username, String sessionId, String details) {
        Map<String, Object> data = new HashMap<>();
        data.put("username", username);
        data.put("sessionId", sessionId);
        data.put("details", details);

        logEvent("SECURITY", "Security", event, String.format("Security event: %s for user %s", event, username), data,
                null);
    }

    public String getCurrentSessionId() {
        return UUID.randomUUID().toString().substring(0, 12);
    }
}
