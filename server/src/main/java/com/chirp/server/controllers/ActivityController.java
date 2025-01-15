package com.chirp.server.controllers;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.services.ActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v2/activities")
public class ActivityController {

	private static final Logger logger = LoggerFactory.getLogger(ActivityController.class);
	private static final String SERVER_ERROR_MSG = "Something went wrong on the server side";

	private final ActivityService activityService;

	public ActivityController(ActivityService activityService) {
		this.activityService = activityService;
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<ActivityModel>> getActivities(@PathVariable String userId) {
		logger.info("Getting user activities for ID: {}" , userId);
		try {
			return ResponseEntity.ok(activityService.getActivityInfo(userId));
		} catch (Exception e) {
			logger.error("Error fetching activities for user {}: {}" , userId , e.getMessage());
			throw new InternalServerErrorException(SERVER_ERROR_MSG);
		}
	}

	@GetMapping
	public ResponseEntity<List<ActivityModel>> getAllActivities() {
		logger.info("Getting all activities from database");
		try {
			return ResponseEntity.ok(activityService.getAllActivities());
		} catch (Exception e) {
			logger.error("Error fetching all activities: {}" , e.getMessage());
			throw new InternalServerErrorException(SERVER_ERROR_MSG);
		}
	}
}