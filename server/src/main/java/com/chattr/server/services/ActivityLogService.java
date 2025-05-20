package com.chattr.server.services;

import com.chattr.server.models.ActivityLog;
import com.chattr.server.repositories.ActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(String username, String action, String details) {
        ActivityLog log = new ActivityLog(username, action, details);
        activityLogRepository.save(log);
    }
}