package com.chattr.server.controllers;

import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.services.CommunityService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing communities, posts, and membership operations.
 */
@RestController
@RequestMapping("/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<Community>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    @GetMapping("/get/posts")
    public ResponseEntity<List<CommunityPost>> getAllPosts() {
        return ResponseEntity.ok(communityService.getAllDBPosts());
    }

    @GetMapping("/get/{communityId}")
    public ResponseEntity<Community> getCommunityById(@PathVariable String communityId) {
        return ResponseEntity.ok(communityService.getCommunityById(communityId));
    }

    @GetMapping("/get/1/{name}")
    public ResponseEntity<Community> getCommunityByName(@PathVariable String name) {
        return ResponseEntity.ok(communityService.getCommunityByName(name));
    }

    @GetMapping("/count/users/{name}")
    public ResponseEntity<Integer> getUserCountForCommunity(@PathVariable String name) {
        return ResponseEntity.ok(communityService.getUserCountForCommunity(name));
    }

    @GetMapping("/get/user/{userId}")
    public ResponseEntity<List<Community>> getCommunitiesByUserId(@PathVariable String userId) {
        List<Community> communities = communityService.getCommunitiesByUserId(userId);
        return communities.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(communities);
    }

    @GetMapping("/get/post/1/{postId}")
    public ResponseEntity<CommunityPost> getCommunityPostById(@PathVariable String postId) {
        return ResponseEntity.ok(communityService.getCommunityPostById(postId));
    }

    @PostMapping("/create/{ownerId}")
    public ResponseEntity<Community> createCommunity(@PathVariable String ownerId, @RequestBody Community community) {
        Community created = communityService.createCommunity(community.getName(), ownerId, community.getDescription(),
                community.getFaqs());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{communityName}/create/post")
    public ResponseEntity<CommunityPost> createPostForCommunity(@PathVariable String communityName,
            @RequestBody CommunityPost communityPost) {
        CommunityPost post = communityService.createCommunityPost(communityName, communityPost.getOwnerId(),
                communityPost.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PostMapping("/join/{communityId}/{userId}")
    public ResponseEntity<String> joinCommunity(@PathVariable String communityId, @PathVariable String userId) {
        communityService.joinCommunity(communityId, userId);
        return ResponseEntity.ok("User has successfully joined the community.");
    }

    @PutMapping("/update/{communityId}")
    public ResponseEntity<Community> updateCommunity(@PathVariable String communityId,
            @RequestBody Map<String, Object> request) {

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
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/leave/{communityId}/{userId}")
    public ResponseEntity<String> leaveCommunity(@PathVariable String communityId, @PathVariable String userId) {
        communityService.leaveCommunity(communityId, userId);
        return ResponseEntity.ok("User has successfully left the community.");
    }
}
