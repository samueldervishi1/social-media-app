package com.chattr.server.services;

import com.chattr.server.models.Hashtag;
import com.chattr.server.repositories.HashtagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for managing hashtag persistence and retrieval.
 */
@Service
public class HashtagService {

    private final HashtagRepository repository;

    public HashtagService(HashtagRepository repository) {
        this.repository = repository;
    }

    /**
     * Retrieves all hashtags in the database.
     */
    public List<Hashtag> getAllHashtags() {
        return repository.findAll();
    }
}