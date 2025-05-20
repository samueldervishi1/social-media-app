package com.chattr.server.repositories;

import com.chattr.server.models.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LikeRepository extends MongoRepository<Like, String> {
}