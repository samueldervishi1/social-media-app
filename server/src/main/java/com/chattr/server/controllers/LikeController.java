package com.chattr.server.controllers;

import com.chattr.server.models.Like;
import com.chattr.server.services.LikeService;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/like")
public class LikeController {

  private final LikeService likeService;

  public LikeController(LikeService likeService) {
    this.likeService = likeService;
  }

  @GetMapping("/count/{postId}")
  public ResponseEntity<Long> getLikeCount(@PathVariable String postId) {
    return ResponseEntity.ok(likeService.getLikeCount(postId));
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<Optional<Like>> getUserLikeCount(@PathVariable String userId) {
    return ResponseEntity.ok(likeService.getUserLikes(userId));
  }

  @PostMapping("/add")
  public ResponseEntity<?> likePost(@RequestBody Map<String, String> payload) {
    String userId = payload.get("userId");
    String postId = payload.get("postId");

    likeService.likePost(userId, postId);
    return ResponseEntity.ok("Post liked");
  }

  @PostMapping("/remove")
  public ResponseEntity<?> unlikePost(@RequestBody Map<String, String> payload) {
    String userId = payload.get("userId");
    String postId = payload.get("postId");

    likeService.unlikePost(userId, postId);
    return ResponseEntity.ok("Post unliked");
  }
}
