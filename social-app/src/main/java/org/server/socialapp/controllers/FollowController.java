package org.server.socialapp.controllers;

import java.util.Collections;
import java.util.List;

import org.server.socialapp.models.FollowerDTO;
import org.server.socialapp.services.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/follow/{followerId}/follow/{followingId}")
    public void followUser(@PathVariable String followerId, @PathVariable String followingId) {
        followService.followUser(followerId, followingId);
    }

    @DeleteMapping("/unfollow/{followerId}/unfollow/{followingId}")
    public void unfollowUser(@PathVariable String followerId, @PathVariable String followingId) {
        followService.unfollowUser(followerId, followingId);
    }

    @GetMapping("/list/{userId}")
    public FollowerDTO getUserConnections(@PathVariable String userId) {
        return followService.getUserConnections(userId);
    }

    @GetMapping("/{userId}/followers/count")
    public int getFollowersCount(@PathVariable String userId) {
        return followService.getUserFollowersCount(userId);
    }

    @GetMapping("/{userId}/following/count")
    public int getFollowingCount(@PathVariable String userId) {
        return followService.getUserFollowingCount(userId);
    }

    @GetMapping("/{userId}/following")
    public List<String> getFollowing(@PathVariable String userId) {
        FollowerDTO followerDTO = followService.getUserConnections(userId);
        return (followerDTO != null) ? followerDTO.getFollowingId() : Collections.emptyList();
    }


}
