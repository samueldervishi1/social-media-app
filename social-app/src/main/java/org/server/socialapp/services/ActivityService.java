package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.repositories.ActivityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);

    @Autowired
    private ActivityRepository activityRepository;

    public List<ActivityModel> getActivityInfo(String userId) {
        try {
            return activityRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error retrieving user info for username {}: {}", userId, e.getMessage());
            throw new InternalServerErrorException("Error retrieving user info");
        }
    }

    public List<ActivityModel> getAllActivities() {
        try {
            return activityRepository.findAll();
        } catch (Exception e) {
            logger.error("Error retrieving all activities: {}", e.getMessage());
            throw new InternalServerErrorException("Error retrieving all activities");
        }
    }

}
