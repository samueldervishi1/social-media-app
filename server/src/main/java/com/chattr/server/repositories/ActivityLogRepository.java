package com.chattr.server.repositories;

import com.chattr.server.models.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {}
