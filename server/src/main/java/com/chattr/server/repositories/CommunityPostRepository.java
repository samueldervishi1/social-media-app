package com.chattr.server.repositories;

import com.chattr.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
    List<CommunityPost> findByCommunityName(String communityName);
}