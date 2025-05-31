package com.chattr.server.controllers;

import com.chattr.server.models.Story;
import com.chattr.server.services.StoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/stories")
public class StoryController {

	private final StoryService storyService;

	public StoryController(StoryService storyService) {
		this.storyService = storyService;
	}

	@PostMapping("/upload")
	public ResponseEntity<String> uploadStory(@RequestParam("file") MultipartFile file ,
	                                          @RequestParam("userId") String userId ,
	                                          @RequestParam(value = "caption", required = false) String caption ,
	                                          @RequestParam(value = "isVideo", defaultValue = "false") boolean isVideo) {
		storyService.createStory(userId , file , caption , isVideo);
		return ResponseEntity.ok("Story uploaded successfully.");
	}

	@GetMapping("/{userId}")
	public ResponseEntity<List<Story>> getUserStories(@PathVariable String userId) {
		return ResponseEntity.ok(storyService.getUserStories(userId));
	}

	@GetMapping("/feed/all")
	public ResponseEntity<List<Story>> getAllStories() {
		return ResponseEntity.ok(storyService.getAllActiveStories());
	}
}