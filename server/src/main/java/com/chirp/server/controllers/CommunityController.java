package com.chirp.server.controllers;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.Community;
import com.chirp.server.models.CommunityPost;
import com.chirp.server.models.Like;
import com.chirp.server.models.Post;
import com.chirp.server.services.CommunityService;
import com.chirp.server.services.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/communities")
public class CommunityController {

	private static final Logger logger = LoggerFactory.getLogger(CommunityController.class);

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
		try {
			int count = communityService.getUserCountForCommunity(name);
			return ResponseEntity.ok(count);
		} catch (NotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0);
		}
	}

	@GetMapping("/user/{userId}")
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

	@GetMapping("/post/{postId}")
	public ResponseEntity<CommunityPost> getCommunityPostById(@PathVariable String postId) {
		logger.info("Attempting to fetch community post with ID: {}" , postId);
		try {
			CommunityPost post = communityService.getCommunityPostById(postId);
			logger.info("Successfully retrieved community post with ID: {}" , postId);
			return new ResponseEntity<>(post , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			logger.warn("Post with ID: {} not found" , postId);
			return new ResponseEntity<>(null , HttpStatus.NOT_FOUND);
		} catch (Exception e) {
			logger.error("Error retrieving post with ID: {}: {}" , postId , e.getMessage() , e);
			return new ResponseEntity<>(null , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/create/{ownerId}")
	public ResponseEntity<Community> createCommunity(@PathVariable String ownerId , @RequestBody Community community) {
		community = communityService.createCommunity(community.getName() , ownerId , community.getDescription());

		return new ResponseEntity<>(community , HttpStatus.CREATED);
	}

	@PostMapping("/{communityName}/posts")
	public CommunityPost createPostForCommunity(
			@PathVariable String communityName ,
			@RequestBody CommunityPost communityPost) {
		return communityService.createCommunityPost(communityName , communityPost.getOwnerId() , communityPost.getContent());
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

	@PostMapping("/{communityName}/posts/{postId}/like")
	public ResponseEntity<Like> likePost(
			@PathVariable String communityName ,
			@PathVariable String postId ,
			@RequestParam String userId) throws Exception {

		Like like = communityService.likePostForCommunity(userId , postId);
		return ResponseEntity.ok(like);
	}

	@PostMapping("/{communityName}/comments/{commentId}/like")
	public ResponseEntity<Like> likeComment(
			@PathVariable String communityName ,
			@PathVariable String commentId ,
			@RequestParam String userId) throws Exception {

		Like like = communityService.likeCommentForCommunity(userId , commentId);
		return ResponseEntity.ok(like);
	}
}