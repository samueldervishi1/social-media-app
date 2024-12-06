package com.chirp.server.repositories;

import com.chirp.server.models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
	List<Post> findByUserId(String userId);

	long countByUserIdAndDeletedFalse(String userId);
}