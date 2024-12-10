package com.chirp.server.controllers;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.User;
import com.chirp.server.services.SearchUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

	private final SearchUserService searchUserService;

	public SearchController(SearchUserService searchUserService) {
		this.searchUserService = searchUserService;
	}

	@GetMapping
	public ResponseEntity<?> searchUsers(@RequestParam Optional<String> username) {
		if (username.isPresent() && !username.get().isEmpty()) {
			logger.info("Searching for user: {}" , username.get());
			List<User> users = searchUserService.searchUser(username.get());
			return handleSearchResult(users);
		} else {
			throw new BadRequestException("Invalid search parameters.");
		}
	}

	private ResponseEntity<?> handleSearchResult(List<User> users) {
		if (users.isEmpty()) {
			throw new NotFoundException("User not found.");
		} else {
			return ResponseEntity.ok(users);
		}
	}
}