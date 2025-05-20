package com.chattr.server.repositories;

import com.chattr.server.models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Repository for managing user-generated posts.
 */
public interface PostRepository extends MongoRepository<Post, String> {

    /**
     * Retrieves all posts authored by a specific user.
     *
     * @param userId the user ID
     * @return list of posts by user
     */
    List<Post> findByUserId(String userId);

    /**
     * Counts the number of non-deleted posts created by a user.
     *
     * @param userId the user ID
     * @return number of active posts
     */
    long countByUserIdAndDeletedFalse(String userId);
}