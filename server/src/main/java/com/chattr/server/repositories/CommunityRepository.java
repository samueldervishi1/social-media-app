package com.chattr.server.repositories;

import com.chattr.server.models.Community;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository interface for Community-related operations.
 */
public interface CommunityRepository extends MongoRepository<Community, String> {

    /**
     * Finds a community by its unique name.
     *
     * @param name the community name
     * @return Optional containing the community, if found
     */
    Optional<Community> findByName(String name);

    /**
     * Returns the count of users inside a given community using Mongo aggregation.
     * This avoids loading the entire document just to count the list size.
     *
     * @param name the community name
     * @return Optional containing the user count
     */
    @Aggregation(pipeline = {
            "{ $match: { 'name': ?0 } }",
            "{ $project: { userCount: { $size: '$userIds' } } }"
    })
    Optional<Integer> getUserCountForCommunity(String name);

    /**
     * Finds all communities where the given user is a member.
     *
     * @param userId the user ID to check
     * @return List of communities the user belongs to
     */
    List<Community> findByUserIdsContaining(String userId);
}