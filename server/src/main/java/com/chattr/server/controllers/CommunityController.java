package com.chattr.server.controllers;

import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing communities, posts, and membership operations.
 */
@RestController
@RequestMapping("/community")
public class CommunityController {

    private final CommunityService communityService;
    private final ActivityLogService activityLogService;

    /**
     * Constructor-based dependency injection for CommunityService.
     *
     * @param communityService service handling community logic
     */
    public CommunityController(CommunityService communityService, ActivityLogService activityLogService) {
        this.communityService = communityService;
        this.activityLogService = activityLogService;
    }

    /**
     * Get all available communities.
     *
     * @return list of communities
     */
    @GetMapping("/get/all")
    public ResponseEntity<List<Community>> getAllCommunities() {
        activityLogService.log("anonymous", "COMMUNITY_LIST", "Retrieving all communities");
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    /**
     * Get all community posts from the database.
     *
     * @return list of community posts
     */
    @GetMapping("/get/posts")
    public ResponseEntity<List<CommunityPost>> getAllPosts() {
        activityLogService.log("anonymous", "COMMUNITY_POST_LIST", "Retrieving all community posts");
        return ResponseEntity.ok(communityService.getAllDBPosts());
    }

    /**
     * Get a community by its ID.
     *
     * @param communityId the unique community ID
     * @return community object or 404 if not found
     */
    @GetMapping("/get/{communityId}")
    public ResponseEntity<Community> getCommunityById(@PathVariable String communityId) {
        activityLogService.log("anonymous", "COMMUNITY_BY_ID", "Retrieving community with ID: " + communityId);
        return ResponseEntity.ok(communityService.getCommunityById(communityId));
    }

    /**
     * Get a community by its name.
     *
     * @param name the name of the community
     * @return community object or error if not found
     */
    @GetMapping("/get/1/{name}")
    public ResponseEntity<Community> getCommunityByName(@PathVariable String name) {
        activityLogService.log("anonymous", "COMMUNITY_BY_NAME", "Retrieving community with name: " + name);
        return ResponseEntity.ok(communityService.getCommunityByName(name));
    }

    /**
     * Get user count for a specific community.
     *
     * @param name community name
     * @return number of users
     */
    @GetMapping("/count/users/{name}")
    public ResponseEntity<Integer> getUserCountForCommunity(@PathVariable String name) {
        activityLogService.log("anonymous", "COMMUNITY_COUNT", "Retrieving user count for community: " + name);
        return ResponseEntity.ok(communityService.getUserCountForCommunity(name));
    }

    /**
     * Get all communities a user is part of.
     *
     * @param userId user ID
     * @return list of communities or 204 if empty
     */
    @GetMapping("/get/user/{userId}")
    public ResponseEntity<List<Community>> getCommunitiesByUserId(@PathVariable String userId) {
        List<Community> communities = communityService.getCommunitiesByUserId(userId);
        activityLogService.log("anonymous", "COMMUNITY_BY_USERID", "Retrieving communities for user: " + userId);
        return communities.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(communities);
    }

    /**
     * Get a specific community post by ID.
     *
     * @param postId post ID
     * @return the community post
     */
    @GetMapping("/get/post/1/{postId}")
    public ResponseEntity<CommunityPost> getCommunityPostById(@PathVariable String postId) {
        activityLogService.log("anonymous", "COMMUNITY_POSTS", "Retrieving community post with ID: " + postId);
        return ResponseEntity.ok(communityService.getCommunityPostById(postId));
    }

    /**
     * Create a new community.
     *
     * @param ownerId   the owner's user ID
     * @param community the community data
     * @return the created community
     */
    @PostMapping("/create/{ownerId}")
    public ResponseEntity<Community> createCommunity(@PathVariable String ownerId, @RequestBody Community community) {
        Community created = communityService.createCommunity(
                community.getName(),
                ownerId,
                community.getDescription(),
                community.getFaqs()
        );
		activityLogService.log(ownerId, "CREATE_COMMUNITY", "Created community with name: " + community.getName() + ".");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Create a post within a specific community.
     *
     * @param communityName the community name
     * @param communityPost the post-content
     * @return the created post
     */
    @PostMapping("/{communityName}/create/post")
    public ResponseEntity<CommunityPost> createPostForCommunity(@PathVariable String communityName, @RequestBody CommunityPost communityPost) {
        CommunityPost post = communityService.createCommunityPost(
                communityName,
                communityPost.getOwnerId(),
                communityPost.getContent()
        );
        activityLogService.log(communityPost.getOwnerId(), "CREATE_POST_COMMUNITY", "Created post in community: " + communityName + ".");
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    /**
     * Add a user to a community.
     *
     * @param communityId community ID
     * @param userId      user ID
     * @return success message
     */
    @PostMapping("/join/{communityId}/{userId}")
    public ResponseEntity<String> joinCommunity(@PathVariable String communityId, @PathVariable String userId) {
        communityService.joinCommunity(communityId, userId);
        activityLogService.log(userId, "COMMUNITY_JOIN", "User with ID: " + userId + " joined community with ID: " + communityId);
        return ResponseEntity.ok("User has successfully joined the community.");
    }

    /**
     * Update the details of a community.
     *
     * @param communityId the ID of the community
     * @param request     the fields to update (name, description, faqs)
     * @return updated community
     */
    @PutMapping("/update/{communityId}")
    public ResponseEntity<Community> updateCommunity(@PathVariable String communityId, @RequestBody Map<String, Object> request) {

        String newName = (String) request.get("name");
        String description = (String) request.get("description");

        List<Faq> faqs = null;
        if (request.containsKey("faqs")) {
            Object faqsObj = request.get("faqs");
            if (faqsObj instanceof List<?> faqsList) {
                faqs = new ArrayList<>();

                for (Object item : faqsList) {
                    if (item instanceof Map<?, ?> map) {
                        Object question = map.get("question");
                        Object answer = map.get("answer");

                        if (question instanceof String && answer instanceof String) {
                            faqs.add(new Faq((String) question, (String) answer));
                        }
                    }
                }
            }
        }

        Community updated = communityService.updateCommunity(communityId, newName, description, faqs);
        activityLogService.log(updated.getOwnerId(), "COMMUNITY_UPDATE", "Community with ID: " + communityId + " has been updated");
        return ResponseEntity.ok(updated);
    }

    /**
     * Remove a user from a community.
     *
     * @param communityId community ID
     * @param userId      user ID
     * @return success message
     */
    @PostMapping("/leave/{communityId}/{userId}")
    public ResponseEntity<String> leaveCommunity(@PathVariable String communityId, @PathVariable String userId) {
        communityService.leaveCommunity(communityId, userId);
        activityLogService.log(userId, "COMMUNITY_LEAVE", "User with ID: " + userId + " left community with ID: " + communityId);
        return ResponseEntity.ok("User has successfully left the community.");
    }
}