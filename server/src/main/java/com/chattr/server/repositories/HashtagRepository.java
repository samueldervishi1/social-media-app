package com.chattr.server.repositories;

import com.chattr.server.models.Hashtag;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HashtagRepository extends MongoRepository<Hashtag, String> {
}
