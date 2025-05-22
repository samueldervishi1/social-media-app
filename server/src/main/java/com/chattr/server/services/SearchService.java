package com.chattr.server.services;

import com.chattr.server.models.Community;
import com.chattr.server.models.User;
import com.chattr.server.repositories.SearchRepository;
import com.chattr.server.repositories.SearchUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for searching users and communities by name.
 */
@Service
public class SearchService {

    private final SearchRepository searchRepository;
    private final SearchUserRepository searchUserRepository;

    public SearchService(SearchRepository searchRepository, SearchUserRepository searchUserRepository) {
        this.searchRepository = searchRepository;
        this.searchUserRepository = searchUserRepository;
    }

    // --- Community search (optional / future use) ---
    public List<Community> searchCommunitiesByName(String name) {
        return searchRepository.findByName(name);
    }

    public List<User> searchUsers(String query) {
        String rawQuery = query.trim().toLowerCase();
        String condensed = rawQuery.replaceAll("\\s+", "");

        List<User> results = searchUserRepository
                .findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(query, query);

        return results.stream()
                .filter(user -> {
                    String normalizedFullName = user.getFullName() != null
                            ? user.getFullName().toLowerCase().replaceAll("\\s+", "")
                            : "";
                    return normalizedFullName.contains(condensed);
                })
                .toList();
    }
}