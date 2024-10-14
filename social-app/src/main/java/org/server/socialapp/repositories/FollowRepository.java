package org.server.socialapp.repositories;

import org.server.socialapp.models.FollowerDTO;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FollowRepository extends MongoRepository<FollowerDTO, String> {
    FollowerDTO findByUserId(String id);
}
