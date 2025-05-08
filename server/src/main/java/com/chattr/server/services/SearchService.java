package com.chattr.server.services;

import com.chattr.server.models.Community;
import com.chattr.server.repositories.SearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchService {

    private final SearchRepository searchRepository;

    public SearchService(SearchRepository searchRepository) {
        this.searchRepository = searchRepository;
    }

    public List<Community> findByName(String name) {
        return searchRepository.findByName(name);
    }
}