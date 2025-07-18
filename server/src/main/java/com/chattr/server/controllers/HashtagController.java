package com.chattr.server.controllers;

import com.chattr.server.models.Hashtag;
import com.chattr.server.services.HashtagService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing hashtags.
 */
@RestController
@RequestMapping("/hashtags")
public class HashtagController {

    private final HashtagService hashtagService;

    public HashtagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllHashtags() {
        try {
            List<Hashtag> hashtags = hashtagService.getAllHashtags();

            Map<String, Object> response = new HashMap<>();
            response.put("hashtags", hashtags);
            response.put("count", hashtags.size());
            response.put("code", 200);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve hashtags");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("code", 500);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/post")
    public Hashtag createHashtag(@RequestBody Hashtag hashtag) {
        return hashtagService.createHashtag(hashtag);
    }
}
