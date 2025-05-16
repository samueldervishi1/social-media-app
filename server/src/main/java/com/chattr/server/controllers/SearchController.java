package com.chattr.server.controllers;

import com.chattr.server.models.Community;
import com.chattr.server.services.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for searching communities by name.
 */
@RestController
@RequestMapping("/search")
public class SearchController {

	private final SearchService searchService;

	/**
	 * Constructor for injecting SearchService.
	 */
	public SearchController(SearchService searchService) {
		this.searchService = searchService;
	}

	/**
	 * Search communities by partial name match (case-insensitive).
	 *
	 * @param name the query string to search by
	 * @return list of matching communities
	 */
	@GetMapping("/communities")
	public List<Community> findByNameContainingIgnoreCase(@RequestParam String name) {
		return searchService.findByName(name);
	}
}