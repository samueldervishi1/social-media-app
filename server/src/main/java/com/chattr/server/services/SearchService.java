package com.chattr.server.services;

import com.chattr.server.models.Community;
import com.chattr.server.repositories.SearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for searching communities by name using the search repository.
 */
@Service
public class SearchService {

	private final SearchRepository searchRepository;

	public SearchService(SearchRepository searchRepository) {
		this.searchRepository = searchRepository;
	}

	/**
	 * Searches for communities with names matching the provided input.
	 *
	 * @param name the name or partial name to search
	 * @return list of matching communities
	 */
	public List<Community> findByName(String name) {
		return searchRepository.findByName(name);
	}
}