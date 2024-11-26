package com.chirp.server.repositories;

import com.chirp.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
}