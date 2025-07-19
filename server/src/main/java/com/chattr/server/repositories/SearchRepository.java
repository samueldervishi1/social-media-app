package com.chattr.server.repositories;

import com.chattr.server.models.Community;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface SearchRepository extends MongoRepository<Community, String> {

    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Community> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Community> findByName(String name);
}
