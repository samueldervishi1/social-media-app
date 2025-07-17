package com.chattr.server.repositories;

import com.chattr.server.models.HealthLog;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HealthLogRepository extends MongoRepository<HealthLog, String> {
    List<HealthLog> findByDate(LocalDate date);
}
