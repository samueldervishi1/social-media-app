package com.chattr.server.controllers;

import com.chattr.server.models.FollowRequest;
import com.chattr.server.models.FollowStatus;
import com.chattr.server.services.FollowService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/follow")
public class FollowController {

  private final FollowService followService;

  public FollowController(FollowService followService) {
    this.followService = followService;
  }

  @GetMapping("/mutual")
  public ResponseEntity<?> isMutualFollow(
      @RequestParam String userAId, @RequestParam String userBId) {
    boolean isMutual = followService.isMutualFollow(userAId, userBId);
    return ResponseEntity.ok(Map.of("mutual", isMutual));
  }

  @GetMapping("/mutual-connections")
  public ResponseEntity<?> getMutualConnections(
      @RequestParam String viewerId, @RequestParam String profileId) {
    List<String> mutuals = followService.getMutualConnections(viewerId, profileId);
    return ResponseEntity.ok(Map.of("mutualConnections", mutuals));
  }

  @GetMapping("/requests/pending")
  public ResponseEntity<?> getPendingFollowRequests(@RequestParam String userId) {
    List<FollowRequest> pendingRequests = followService.getPendingFollowRequests(userId);
    return ResponseEntity.ok(pendingRequests);
  }

  @GetMapping("/status")
  public ResponseEntity<?> getFollowStatus(
      @RequestParam String senderId, @RequestParam String receiverId) {
    FollowStatus status = followService.getFollowStatus(senderId, receiverId);
    return ResponseEntity.ok(Map.of("status", status.name()));
  }

  @PostMapping("/send")
  public ResponseEntity<?> sendFollowRequest(@RequestBody Map<String, String> payload) {
    String senderId = payload.get("senderId");
    String receiverId = payload.get("receiverId");

    followService.sendFollowRequest(senderId, receiverId);
    return ResponseEntity.ok("Follow request sent");
  }

  @PostMapping("/accept")
  public ResponseEntity<?> acceptFollowRequest(@RequestBody Map<String, String> payload) {
    String requestId = payload.get("requestId");

    followService.acceptFollowRequest(requestId);
    return ResponseEntity.ok("Follow request accepted");
  }

  @PostMapping("/followback")
  public ResponseEntity<?> followBack(@RequestBody Map<String, String> payload) {
    String senderId = payload.get("senderId");
    String receiverId = payload.get("receiverId");

    followService.followBack(senderId, receiverId);
    return ResponseEntity.ok("Follow-back request sent");
  }

  @DeleteMapping("/requests/reject")
  public ResponseEntity<?> rejectFollowRequest(
      @RequestParam String requestId, @RequestParam String receiverId) {
    followService.rejectFollowRequest(requestId, receiverId);
    return ResponseEntity.ok("Follow request rejected");
  }
}
