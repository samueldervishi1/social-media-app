package com.chattr.server.repositories;

import com.chattr.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
}