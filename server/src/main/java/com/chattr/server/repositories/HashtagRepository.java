package com.chattr.server.repositories;

import com.chattr.server.models.Hashtag;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repository for storing and retrieving hashtags.
 */
public interface HashtagRepository extends MongoRepository<Hashtag, String> {
}