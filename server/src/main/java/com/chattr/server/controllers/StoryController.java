package com.chattr.server.controllers;

import com.chattr.server.models.Story;
import com.chattr.server.services.StoryService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Story>> getUserStories(@PathVariable String userId) {
        return ResponseEntity.ok(storyService.getUserStories(userId));
    }

    @GetMapping("/{storyId}/views")
    public ResponseEntity<Map<String, Integer>> getStoryViews(@PathVariable String storyId) {
        return ResponseEntity.ok(storyService.getStoryViewCount(storyId));
    }

    @GetMapping("/feed/all")
    public ResponseEntity<List<Story>> getAllStories() {
        return ResponseEntity.ok(storyService.getAllActiveStories());
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadStory(@RequestParam("files") MultipartFile[] files,
            @RequestParam("userId") String userId, @RequestParam(value = "caption", required = false) String caption) {
        storyService.createStory(userId, files, caption);
        return ResponseEntity.ok("Story uploaded successfully.");
    }

    @PutMapping("/{storyId}/view")
    public ResponseEntity<String> viewStory(@PathVariable String storyId, @RequestParam("viewerId") String viewerId) {
        storyService.markStoryAsViewed(storyId, viewerId);
        return ResponseEntity.ok("View registered");
    }
}
