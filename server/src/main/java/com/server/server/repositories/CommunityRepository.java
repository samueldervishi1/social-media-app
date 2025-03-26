package com.server.server.repositories;

import com.server.server.models.Community;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends MongoRepository<Community, String> {
	Optional<Community> findByName(String name);

	@Aggregation(pipeline = {
        "{ $match: { 'name': { $regex: ?0, $options: 'i' } } }",
        "{ $project: { userCount: { $size: '$userIds' } } }"
    })
    Optional<Integer> getUserCountForCommunity(String name);
	List<Community> findByUserIdsContaining(String userId);
}