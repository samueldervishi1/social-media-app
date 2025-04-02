package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.HealthLog;
import com.server.server.repositories.HealthLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Slf4j
@Service
public class HealthLogService {
	private final HealthLogRepository healthLogRepository;

	public HealthLogService(HealthLogRepository healthLogRepository) {
		this.healthLogRepository = healthLogRepository;
	}

	public void saveHealthCheck(String status) {
		try {
			LocalDate today = LocalDate.now();
			LocalDateTime now = LocalDateTime.now();

			HealthLog healthLog = healthLogRepository.findByDate(today)
					.orElseGet(() -> {
						HealthLog newLog = new HealthLog();
						newLog.setDate(today);
						return newLog;
					});

			List<HealthLog.HealthEntry> entries = healthLog.getChecks();

			if (!entries.isEmpty()) {
				HealthLog.HealthEntry lastEntry = entries.get(entries.size() - 1);

				LocalDateTime lastTimestamp = LocalDateTime.parse(lastEntry.getTimestamp());
				Duration diff = Duration.between(lastTimestamp , now);

				if (diff.toMinutes() < 30) {
					log.info("Health check already saved {} minutes ago. Skipping save." , diff.toMinutes());
					return;
				}
			}

			HealthLog.HealthEntry newEntry = new HealthLog.HealthEntry();
			newEntry.setTimestamp(now.toString());
			newEntry.setStatus(status);

			healthLog.getChecks().add(newEntry);
			healthLogRepository.save(healthLog);

			log.info("Health check saved at {}" , now);

		} catch (Exception e) {
			log.error("Error while saving health check: {}" , e.getMessage() , e);
			throw new CustomException(500 , "Something went wrong while saving health check");
		}
	}
}