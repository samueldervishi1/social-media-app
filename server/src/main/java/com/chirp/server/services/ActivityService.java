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
import java.util.Optional;

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
			Optional<ActivityModel> existingActivity = activityRepository.findByUserId(userId).stream()
					.filter(activity -> activity.getActionType().getAllActivity().equals(actionType.getAllActivity()))
					.findFirst();

			ActivityModel activity = existingActivity.map(existing -> {
				existing.setTimestamp(Instant.now());
				existing.setStatus(status);
				return existing;
			}).orElseGet(() -> new ActivityModel(actionType , userId , Instant.now() , status));

			ActivityModel savedActivity = activityRepository.save(activity);
			logger.info("{} activity: {}" , existingActivity.isPresent() ? "Updated" : "Created new" , savedActivity);

		} catch (Exception e) {
			logger.error("Error updating or creating activity for user {}: {}" , userId , e.getMessage());
			throw new InternalServerErrorException("Error updating or creating activity");
		}
	}
}