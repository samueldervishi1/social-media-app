package com.chirp.server.repositories;

import com.chirp.server.models.FollowerDTO;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FollowRepository extends MongoRepository<FollowerDTO, String> {
	FollowerDTO findByUserId(String id);
}
