package com.server.server.controllers;

import com.server.server.exceptions.CustomException;
import com.server.server.models.*;
import com.server.server.services.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommunityController {

	private final CommunityService communityService;

	public CommunityController(CommunityService communityService) {
		this.communityService = communityService;
	}

	@GetMapping("/data-flux")
	public ResponseEntity<List<Community>> getAllCommunities() {
		List<Community> communities = communityService.getAllCommunities();
		System.out.println("Retrieved communities: " + communities);
		return new ResponseEntity<>(communities , HttpStatus.OK);
	}

	@GetMapping("/synth-stream")
	public ResponseEntity<List<CommunityPost>> getAllPosts() {
		try {
			List<CommunityPost> posts = communityService.getAllDBPosts();
			return ResponseEntity.ok(posts);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/sector/{communityId}")
	public ResponseEntity<Community> getCommunityById(@PathVariable String communityId) {
		try {
			Community community = communityService.getCommunityById(communityId);
			return new ResponseEntity<>(community , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/access-node/{name}")
	public ResponseEntity<Community> getCommunityByName(@PathVariable String name) {
		try {
			Community community = communityService.getCommunityByName(name);
			return ResponseEntity.ok(community);
		} catch (CustomException e) {
			if (e.getCode() == 404) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/sector-metrics/{name}")
	public ResponseEntity<Integer> getUserCountForCommunity(@PathVariable String name) {
		try {
			int count = communityService.getUserCountForCommunity(name);
			return ResponseEntity.ok(count);
		} catch (CustomException e) {
			if (e.getCode() == 404) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0);
			} else if (e.getCode() == 500) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0);
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0);
		}
	}


	@GetMapping("/cyber-user/{userId}")
	public ResponseEntity<List<Community>> getCommunitiesByUserId(@PathVariable String userId) {
		try {
			List<Community> communities = communityService.getCommunitiesByUserId(userId);
			if (communities.isEmpty()) {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
			return new ResponseEntity<>(communities , HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/data-stream/{postId}")
	public ResponseEntity<CommunityPost> getCommunityPostById(@PathVariable String postId) {
		try {
			CommunityPost post = communityService.getCommunityPostById(postId);
			return new ResponseEntity<>(post , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(null , HttpStatus.NOT_FOUND);
		} catch (Exception e) {
			return new ResponseEntity<>(null , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/deploy/{ownerId}")
	public ResponseEntity<Community> createCommunity(@PathVariable String ownerId , @RequestBody Community community) {
		community = communityService.createCommunity(community.getName() , ownerId , community.getDescription() , community.getFaqs());

		return new ResponseEntity<>(community , HttpStatus.CREATED);
	}

	@PostMapping("/{communityName}/uplink-posts")
	public CommunityPost createPostForCommunity(
			@PathVariable String communityName ,
			@RequestBody CommunityPost communityPost) {
		return communityService.createCommunityPost(communityName , communityPost.getOwnerId() , communityPost.getContent());
	}

	@PostMapping("/link-up/{communityId}/{userId}")
	public ResponseEntity<String> joinCommunity(@PathVariable String communityId , @PathVariable String userId) {
		try {
			communityService.joinCommunity(communityId , userId);
			return new ResponseEntity<>("User has successfully joined the community." , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(e.getMessage() , HttpStatus.NOT_FOUND);
		}
	}
}