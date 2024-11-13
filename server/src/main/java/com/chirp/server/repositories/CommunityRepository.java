package com.chirp.server.repositories;

import com.chirp.server.models.Community;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CommunityRepository extends MongoRepository<Community, String> {
	Optional<Community> findByName(String name);
}
