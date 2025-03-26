package com.server.server.repositories;

import com.server.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
}