package org.server.socialapp.controllers;

import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.services.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activity")
public class ActivityController {
    @Autowired
    private ActivityService activityService;

    @GetMapping("/{userId}")
    public List<ActivityModel> getUserInfo(@PathVariable String userId) {
        return activityService.getActivityInfo(userId);
    }

    @GetMapping("/all")
    public List<ActivityModel> getAllActivities() {
        return activityService.getAllActivities();
    }

}
