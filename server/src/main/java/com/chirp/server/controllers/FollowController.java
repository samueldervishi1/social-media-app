package com.chirp.server.controllers;

import com.chirp.server.models.FollowerDTO;
import com.chirp.server.services.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v2/users")
public class FollowController {

	@Autowired
	private FollowService followService;

	@PostMapping("/follow/{followerId}/{followingId}")
	public ResponseEntity<String> followUser(@PathVariable String followerId , @PathVariable String followingId) {
		followService.followUser(followerId , followingId);
		return ResponseEntity.status(HttpStatus.CREATED).body("Successfully followed user with ID: " + followingId);
	}

	@DeleteMapping("/unfollow/{followerId}/{followingId}")
	public ResponseEntity<String> unfollowUser(@PathVariable String followerId , @PathVariable String followingId) {
		followService.unfollowUser(followerId , followingId);
		return ResponseEntity.ok("Successfully unfollowed user with ID: " + followingId);
	}

	@GetMapping("/list/{userId}")
	public ResponseEntity<FollowerDTO> getUserConnections(@PathVariable String userId) {
		FollowerDTO followerDTO = followService.getUserConnections(userId);
		return ResponseEntity.ok(followerDTO);
	}

	@GetMapping("/{userId}/followers/count")
	public ResponseEntity<Integer> getFollowersCount(@PathVariable String userId) {
		int count = followService.getUserFollowersCount(userId);
		return ResponseEntity.ok(count);
	}

	@GetMapping("/{userId}/following/count")
	public ResponseEntity<Integer> getFollowingCount(@PathVariable String userId) {
		int count = followService.getUserFollowingCount(userId);
		return ResponseEntity.ok(count);
	}

	@GetMapping("/{userId}/following")
	public ResponseEntity<List<String>> getFollowing(@PathVariable String userId) {
		FollowerDTO followerDTO = followService.getUserConnections(userId);
		List<String> followingIds = (followerDTO != null) ? followerDTO.getFollowingId() : Collections.emptyList();
		return ResponseEntity.ok(followingIds);
	}
}
