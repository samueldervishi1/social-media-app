package com.chattr.server.repositories;

import com.chattr.server.models.Community;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Repository for searching communities by name.
 */
public interface SearchRepository extends MongoRepository<Community, String> {

    /**
     * Retrieves all communities with a matching name.
     * This can be useful for search functionality.
     *
     * @param name the name of the community to search for
     * @return a list of communities with the given name
     */
    List<Community> findByName(String name);
}