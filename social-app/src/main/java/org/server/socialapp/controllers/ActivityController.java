package org.server.socialapp.controllers;

import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.services.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v2/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<ActivityModel>> getUserActivities(@PathVariable String userId) {
        List<ActivityModel> activities = activityService.getActivityInfo(userId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ActivityModel>> getAllActivities() {
        List<ActivityModel> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }
}
