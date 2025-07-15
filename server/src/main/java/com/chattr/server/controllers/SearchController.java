package com.chattr.server.controllers;

import com.chattr.server.models.Community;
import com.chattr.server.models.User;
import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.SearchService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for searching communities by name. */
@RestController
@RequestMapping("/search")
public class SearchController {

  private final SearchService searchService;
  private final ActivityLogService activityLogService;

  public SearchController(SearchService searchService, ActivityLogService activityLogService) {
    this.searchService = searchService;
    this.activityLogService = activityLogService;
  }

  @GetMapping("/community")
  public List<Community> findByNameContainingIgnoreCase(@RequestParam String name) {
    activityLogService.log(
        name, "SEARCH_COMMUNITY", "Searching for communities with name containing: " + name + ".");
    return searchService.searchCommunitiesByName(name);
  }

  @GetMapping("/all")
  public ResponseEntity<List<User>> searchAll(@RequestParam String query) {
    List<User> users = searchService.searchUsers(query);
    return ResponseEntity.ok(users);
  }
}
