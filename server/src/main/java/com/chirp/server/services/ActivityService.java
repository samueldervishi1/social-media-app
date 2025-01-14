package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.repositories.ActivityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ActivityService {
	private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);

	private final ActivityRepository activityRepository;

	public ActivityService(ActivityRepository activityRepository) {
		this.activityRepository = activityRepository;
	}

	public List<ActivityModel> getActivityInfo(String userId) {
		try {
			return activityRepository.findByUserId(userId);
		} catch (Exception e) {
			logger.error("Error retrieving user info for username {}: {}" , userId , e.getMessage());
			throw new InternalServerErrorException("Error retrieving user info");
		}
	}

	public List<ActivityModel> getAllActivities() {
		try {
			return activityRepository.findAll();
		} catch (Exception e) {
			logger.error("Error retrieving all activities: {}" , e.getMessage());
			throw new InternalServerErrorException("Error retrieving all activities");
		}
	}

	@Transactional
	public void updateOrCreateActivity(String userId , ActivityModel.ActionType actionType , String status) {
		try {
			List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);
			ActivityModel existingActivity = existingActivities.stream()
					.filter(activity -> activity.getActionType().getAllActivity().equals(actionType.getAllActivity()))
					.findFirst()
					.orElse(null);

			if (existingActivity != null) {
				existingActivity.setTimestamp(Instant.now());
				existingActivity.setStatus(status);

				ActivityModel updatedActivity = activityRepository.save(existingActivity);

				logger.info("Updated existing activity: {}" , updatedActivity);
			} else {
				ActivityModel newActivity = new ActivityModel(actionType , userId , Instant.now() , status);
				ActivityModel savedActivity = activityRepository.save(newActivity);

				logger.info("Created new activity: {}" , savedActivity);
			}
		} catch (Exception e) {
			logger.error("Error updating or creating activity for user {}: {}" , userId , e.getMessage());
			throw new InternalServerErrorException("Error updating or creating activity");
		}
	}
}