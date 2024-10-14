package org.server.socialapp.controllers;

import org.server.socialapp.models.User;
import org.server.socialapp.services.SearchUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/search/users")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchUserService searchUserService;

    @GetMapping
    public ResponseEntity<?> searchUsers(
            @RequestParam Optional<String> username,
            @RequestParam Optional<String> name,
            @RequestParam Optional<String> surname) {

        if (username.isPresent() && !username.get().isEmpty()) {
            logger.info("Searching for user: {}", username.get());
            List<User> users = searchUserService.searchUser(username.get());
            return handleSearchResult(users);
        } else if (name.isPresent() && !name.get().isEmpty() && surname.isPresent() && !surname.get().isEmpty()) {
            List<User> users = searchUserService.searchUserByNameAndSurname(name.get(), surname.get());
            return handleSearchResult(users);
        } else {
            return ResponseEntity.badRequest().body("Invalid search parameters.");
        }
    }

    private ResponseEntity<?> handleSearchResult(List<User> users) {
        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        } else {
            return ResponseEntity.ok(users);
        }
    }
}
