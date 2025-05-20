package com.chattr.server.repositories;

import com.chattr.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * MongoDB repository for community posts.
 */
public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {

    /**
     * Finds all posts for a specific community by name.
     *
     * @param communityName the name of the community
     * @return List of matching posts
     */
    List<CommunityPost> findByCommunityName(String communityName);
}