package com.chattr.server.repositories;

import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends MongoRepository<Community, String> {
    Optional<Community> findByName(String name);

    @Aggregation(pipeline = {
            "{ $match: { 'name': ?0 } }",
            "{ $project: { userCount: { $size: '$userIds' } } }"
    })
    Optional<Integer> getUserCountForCommunity(String name);

    List<Community> findByUserIdsContaining(String userId);
}