package com.chattr.server.controllers;

import com.chattr.server.models.Hashtag;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.HashtagService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Map<String, Object>> getAllHashtags() {
        try {
            List<Hashtag> hashtags = hashtagService.getAllHashtags();

            Map<String, Object> response = new HashMap<>();
            response.put("hashtags", hashtags);
            response.put("count", hashtags.size());
            response.put("code", 200);

            activityLogService.log("anonymous", "HASHTAG_GET", "Retrieved all hashtags successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve hashtags");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("code", 500);

            activityLogService.log("anonymous", "HASHTAG_GET_ERROR", "Failed to retrieve hashtags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/post")
    public Hashtag createHashtag(@RequestBody Hashtag hashtag) {
        activityLogService.log("anonymous", "HASHTAG_CREATE", "Creating hashtag: " + hashtag.getName());
        return hashtagService.createHashtag(hashtag);
    }
}