package com.server.server.repositories;

import com.server.server.models.Community;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchRepository extends MongoRepository<Community, String> {
	List<Community> findByName(String name);
}