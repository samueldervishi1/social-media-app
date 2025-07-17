package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.HealthLog;
import com.chattr.server.repositories.HealthLogRepository;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service for tracking periodic application health checks, storing logs by
 * date, and avoiding duplicate entries within 30 minutes.
 */
@Slf4j
@Service
public class HealthLogService {

    private final HealthLogRepository healthLogRepository;

    public HealthLogService(HealthLogRepository healthLogRepository) {
        this.healthLogRepository = healthLogRepository;
    }

    @Scheduled(cron = "0 */30 * * * *")
    public void scheduledHealthCheck() {
        log.info("Running scheduled health check...");
        saveHealthCheck("Scheduled check: All systems operational");
    }

    public void saveHealthCheck(String status) {
        try {
            LocalDate today = LocalDate.now();
            LocalDateTime now = LocalDateTime.now();

            List<HealthLog> logs = healthLogRepository.findByDate(today);
            HealthLog healthLog = logs.isEmpty() ? new HealthLog() : logs.get(0);

            if (logs.size() > 1) {
                log.warn("Multiple logs found for today: {}", logs.size());
            }

            if (!logs.isEmpty()) {
                List<HealthLog.HealthEntry> entries = healthLog.getChecks();
                if (!entries.isEmpty()) {
                    LocalDateTime lastTimestamp = LocalDateTime.parse(entries.get(entries.size() - 1).getTimestamp());
                    long minutesDiff = Duration.between(lastTimestamp, now).toMinutes();

                    if (minutesDiff < 30) {
                        log.info("Last health check was {} minutes ago. Skipping save.", minutesDiff);
                        return;
                    }
                }
            }

            HealthLog.HealthEntry entry = new HealthLog.HealthEntry();
            entry.setTimestamp(now.toString());
            entry.setStatus(status);

            healthLog.setDate(today);
            healthLog.getChecks().add(entry);
            healthLogRepository.save(healthLog);

            log.info("Health check saved at {}", now);

        } catch (Exception e) {
            log.error("Error while saving health check: {}", e.getMessage(), e);
            throw new CustomException(500, "Something went wrong while saving health check");
        }
    }

    public HealthLog.HealthEntry getLastHealthEntry() {
        List<HealthLog> logs = healthLogRepository.findByDate(LocalDate.now());
        if (!logs.isEmpty() && !logs.get(0).getChecks().isEmpty()) {
            return logs.get(0).getChecks().get(logs.get(0).getChecks().size() - 1);
        }
        return null;
    }
}
