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

    /**
     * Constructor-based injection of HashtagService.
     *
     * @param hashtagService the service handling hashtag logic
     */
    public HashtagController(HashtagService hashtagService, ActivityLogService activityLogService) {
        this.hashtagService = hashtagService;
        this.activityLogService = activityLogService;
    }

    /**
     * Retrieves all available hashtags.
     *
     * @return list of hashtags
     */
    @GetMapping
    public List<Hashtag> getAllHashtags() {
        activityLogService.log("anonymous", "HASHTAG_GET", "Retrieving all hashtags");
        return hashtagService.getAllHashtags();
    }
}