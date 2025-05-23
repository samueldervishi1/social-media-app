package com.chattr.server.controllers;

import com.chattr.server.models.Hashtag;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.HashtagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing hashtags.
 */
@RestController
@RequestMapping("/hashtags")
public class HashtagController {

    private final HashtagService hashtagService;
    private final ActivityLogService activityLogService;

    public HashtagController(HashtagService hashtagService, ActivityLogService activityLogService) {
        this.hashtagService = hashtagService;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<Hashtag> getAllHashtags() {
        activityLogService.log("anonymous", "HASHTAG_GET", "Retrieving all hashtags");
        return hashtagService.getAllHashtags();
    }
}