package com.chattr.server.repositories;

import com.chattr.server.models.HealthLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for managing daily health check logs.
 */
public interface HealthLogRepository extends MongoRepository<HealthLog, String> {

	/**
	 * Retrieves all health logs for a specific date.
	 *
	 * @param date the date to search
	 * @return list of matching health logs
	 */
	List<HealthLog> findByDate(LocalDate date);
}