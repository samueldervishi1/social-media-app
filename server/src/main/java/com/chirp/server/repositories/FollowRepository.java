package com.chirp.server.repositories;

import com.chirp.server.models.FollowerDTO;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FollowRepository extends MongoRepository<FollowerDTO, String> {
	Optional<FollowerDTO> findByUserId(String id);
}