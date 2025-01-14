package com.chirp.server.controllers;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.services.ActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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

	private final ActivityService activityService;

	public ActivityController(ActivityService activityService) {
		this.activityService = activityService;
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<ActivityModel>> getActivities(@PathVariable String userId) {
		logger.info("Getting user activities for ID: {}" , userId);
		try {
			List<ActivityModel> activities = activityService.getActivityInfo(userId);
			return ResponseEntity.ok(activities);
		} catch (Exception e) {
			logger.error("Something went wrong: {} when trying to get activity for ID: {}" , e.getMessage() , userId);
			throw new InternalServerErrorException("Something went wrong on the server side");
		}
	}

	@GetMapping
	public ResponseEntity<List<ActivityModel>> getAllActivities() {
		logger.info("Getting all activities from database");
		try {
			List<ActivityModel> activities = activityService.getAllActivities();
			return ResponseEntity.ok(activities);
		} catch (Exception e) {
			logger.error("Something went wrong: {}" , e.getMessage());
			throw new InternalServerErrorException("Something went wrong on the server side");
		}
	}
}