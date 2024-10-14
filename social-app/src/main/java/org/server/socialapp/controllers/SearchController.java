package org.server.socialapp.controllers;

import org.server.socialapp.models.User;
import org.server.socialapp.services.SearchUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search/users")
public class SearchController {
    @Autowired
    private SearchUserService searchUserService;


    @GetMapping
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String surname) {
        List<User> users;

        if (username != null && !username.isEmpty()) {
            System.out.println("Searching for user: " + username);
            users = searchUserService.searchUser(username);
        } else if (name != null && !name.isEmpty() && surname != null && !surname.isEmpty()) {
            users = searchUserService.searchUserByNameAndSurname(name, surname);
        } else {
            return ResponseEntity.badRequest().body("Invalid search parameters.");
        }

        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        } else {
            return ResponseEntity.ok(users);
        }
    }
}
