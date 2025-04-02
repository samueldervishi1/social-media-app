package com.server.server.controllers;

import com.server.server.models.Community;
import com.server.server.services.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SearchController {

	private final SearchService searchService;

	public SearchController(SearchService searchService) {
		this.searchService = searchService;
	}

	@GetMapping("/search")
	public List<Community> findByNameContainingIgnoreCase(@RequestParam String name) {
		return searchService.findByName(name);
	}
}