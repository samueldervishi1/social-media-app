package com.chattr.server.repositories;

import com.chattr.server.models.HealthLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HealthLogRepository extends MongoRepository<HealthLog, String> {
    List<HealthLog> findByDate(LocalDate date);
}