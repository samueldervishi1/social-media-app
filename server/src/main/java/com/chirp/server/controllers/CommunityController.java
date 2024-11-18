package com.chirp.server.controllers;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.Community;
import com.chirp.server.models.Post;
import com.chirp.server.services.CommunityService;
import com.chirp.server.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/communities")
public class CommunityController {

	@Autowired
	private CommunityService communityService;

	@Autowired
	private PostService postService;

	@GetMapping("/list")
	public ResponseEntity<List<Community>> getAllCommunities() {
		List<Community> communities = communityService.getAllCommunities();
		if (communities.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		}
		return new ResponseEntity<>(communities , HttpStatus.OK);
	}

	@GetMapping("/c/{communityId}")
	public ResponseEntity<Community> getCommunityById(@PathVariable String communityId) {
		try {
			Community community = communityService.getCommunityById(communityId);
			return new ResponseEntity<>(community , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/{name}")
	public ResponseEntity<Community> getCommunityByName(@PathVariable String name) {
		try {
			Community community = communityService.getCommunityByName(name);
			return ResponseEntity.ok(community);
		} catch (NotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}
	}

	@GetMapping("/c/count/{name}")
	public ResponseEntity<Integer> getUserCountForCommunity(@PathVariable String name) {
		int count = communityService.getUserCountForCommunity(name);
		return ResponseEntity.ok(count);
	}

	@PostMapping("/create/{ownerId}")
	public ResponseEntity<Community> createCommunity(@PathVariable String ownerId , @RequestBody Community community) {
		community = communityService.createCommunity(community.getName() , ownerId , community.getDescription());

		return new ResponseEntity<>(community , HttpStatus.CREATED);
	}

	@PostMapping("/create/post/{communityId}/{userId}")
	public ResponseEntity<Post> createPost(@PathVariable String communityId , @PathVariable String userId , @RequestBody Post post) {
		Post createdPost = postService.createPostForCommunity(communityId , userId , post);
		return new ResponseEntity<>(createdPost , HttpStatus.CREATED);
	}

	@PostMapping("/join/{communityId}/{userId}")
	public ResponseEntity<String> joinCommunity(@PathVariable String communityId , @PathVariable String userId) {
		try {
			communityService.joinCommunity(communityId , userId);
			return new ResponseEntity<>("User has successfully joined the community." , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(e.getMessage() , HttpStatus.NOT_FOUND);
		}
	}
}
