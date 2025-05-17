package com.chattr.server.controllers;

import com.chattr.server.models.Hashtag;
import com.chattr.server.services.HashtagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing hashtags.
 */
@RestController
@RequestMapping("/hashtags")
public class HashtagController {

	private final HashtagService hashtagService;

	/**
	 * Constructor-based injection of HashtagService.
	 *
	 * @param hashtagService the service handling hashtag logic
	 */
	public HashtagController(HashtagService hashtagService) {
		this.hashtagService = hashtagService;
	}

	/**
	 * Retrieves all available hashtags.
	 *
	 * @return list of hashtags
	 */
	@GetMapping
	public List<Hashtag> getAllHashtags() {
		return hashtagService.getAllHashtags();
	}
}