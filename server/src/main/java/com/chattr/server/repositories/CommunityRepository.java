package com.chattr.server.repositories;

import com.chattr.server.models.Community;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityRepository extends MongoRepository<Community, String> {
  Optional<Community> findByName(String name);

  @Aggregation(
      pipeline = {
        "{ $match: { 'name': ?0 } }",
        "{ $project: { userCount: { $size: '$userIds' } } }"
      })
  Optional<Integer> getUserCountForCommunity(String name);

  List<Community> findByUserIdsContaining(String userId);
}
