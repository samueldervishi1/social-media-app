package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.HealthLog;
import com.chattr.server.repositories.HealthLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

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
            HealthLog healthLog;

            if (logs.isEmpty()) {
                healthLog = new HealthLog();
                healthLog.setDate(today);
            } else {
                if (logs.size() > 1) {
                    log.warn("Multiple logs found for today: {}", logs.size());
                }
                healthLog = logs.get(0);
            }

            List<HealthLog.HealthEntry> entries = healthLog.getChecks();
            if (!entries.isEmpty()) {
                HealthLog.HealthEntry lastEntry = entries.get(entries.size() - 1);
                LocalDateTime lastTimestamp = LocalDateTime.parse(lastEntry.getTimestamp());
                Duration diff = Duration.between(lastTimestamp, now);

                if (diff.toMinutes() < 30) {
                    log.info("Last health check was {} minutes ago. Skipping save.", diff.toMinutes());
                    return;
                }
            }

            HealthLog.HealthEntry newEntry = new HealthLog.HealthEntry();
            newEntry.setTimestamp(now.toString());
            newEntry.setStatus(status);

            healthLog.getChecks().add(newEntry);
            healthLogRepository.save(healthLog);

            log.info("Health check saved at {}", now);

        } catch (Exception e) {
            log.error("Error while saving health check: {}", e.getMessage(), e);
            throw new CustomException(500, "Something went wrong while saving health check");
        }
    }

    public HealthLog.HealthEntry getLastHealthEntry() {
        LocalDate today = LocalDate.now();
        List<HealthLog> logs = healthLogRepository.findByDate(today);

        if (!logs.isEmpty()) {
            List<HealthLog.HealthEntry> entries = logs.get(0).getChecks();
            if (!entries.isEmpty()) {
                return entries.get(entries.size() - 1);
            }
        }

        return null;
    }
}