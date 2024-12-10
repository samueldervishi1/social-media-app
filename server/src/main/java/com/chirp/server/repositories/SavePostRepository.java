package com.chirp.server.repositories;

import com.chirp.server.models.SavePost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SavePostRepository extends MongoRepository<SavePost, String> {
	Optional<SavePost> findByUserId(String userId);

	List<SavePost> findByPostIdsContaining(String postId);

	@Query("{ 'postIds': ?0 }")
    int countByPostId(String postId);

}