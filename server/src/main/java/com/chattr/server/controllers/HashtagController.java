package com.chattr.server.controllers;

import com.chattr.server.models.Hashtag;
import com.chattr.server.services.HashtagService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HashtagController {

    private final HashtagService hashtagService;

    public HashtagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping("/hashtags/get")
    public List<Hashtag> getHashtags() {
        return hashtagService.getAllHashtags();
    }

    @PostMapping("hashtags/save")
    public Hashtag saveHashtag(@RequestBody Hashtag hashtag) {
        return hashtagService.saveHashtag(hashtag);
    }
}