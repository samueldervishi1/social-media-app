package com.server.server.repositories;

import com.server.server.models.Hashtag;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HashtagRepository extends MongoRepository<Hashtag,String> {
}
