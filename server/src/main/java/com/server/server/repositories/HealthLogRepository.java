package com.server.server.repositories;

import com.server.server.models.HealthLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface HealthLogRepository extends MongoRepository<HealthLog,String> {
	Optional<HealthLog> findByDate(LocalDate date);
}
