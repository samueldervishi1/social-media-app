package com.chattr.server.services;

import com.chattr.server.models.Community;
import com.chattr.server.models.User;
import com.chattr.server.repositories.SearchRepository;
import com.chattr.server.repositories.SearchUserRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** Service for searching users and communities by name. */
@Service
public class SearchService {

    private final SearchRepository searchRepository;
    private final SearchUserRepository searchUserRepository;

    public SearchService(SearchRepository searchRepository, SearchUserRepository searchUserRepository) {
        this.searchRepository = searchRepository;
        this.searchUserRepository = searchUserRepository;
    }

    public List<Community> searchCommunitiesByName(String name) {
        if (!StringUtils.hasText(name) || name.trim().length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, 20);
        return searchRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
    }

    public List<User> searchUsers(String query) {
        if (!StringUtils.hasText(query) || query.trim().length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, 20);

        return searchUserRepository.findUsersWithTextSearch(query.trim(), pageable);
    }
}
