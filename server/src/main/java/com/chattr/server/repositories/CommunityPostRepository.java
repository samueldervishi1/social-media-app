package com.chattr.server.repositories;

import com.chattr.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
    /**
     * Find all posts associated with a specific community name
     *
     * @param communityName The name of the community
     * @return List of posts belonging to the community
     */
    List<CommunityPost> findByCommunityName(String communityName);
}