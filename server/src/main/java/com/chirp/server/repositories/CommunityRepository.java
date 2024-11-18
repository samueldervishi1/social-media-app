package com.chirp.server.repositories;

import com.chirp.server.models.Community;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends MongoRepository<Community, String> {
	Optional<Community> findByName(String name);
	List<Community> findByNameContaining(String name);
}