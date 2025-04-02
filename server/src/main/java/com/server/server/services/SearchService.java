package com.server.server.services;

import com.server.server.models.Community;
import com.server.server.repositories.SearchRepository;
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