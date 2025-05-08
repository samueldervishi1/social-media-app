package com.chattr.server.controllers;

import com.chattr.server.models.Community;
import com.chattr.server.services.SearchService;
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