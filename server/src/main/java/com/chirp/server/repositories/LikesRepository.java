package com.chirp.server.repositories;

import com.chirp.server.models.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LikesRepository extends MongoRepository<Like, String> {
	List<Like> findByUserId(String userId);

	List<Like> findByPostIdContaining(String postId);

	List<Like> findByCommentIdContaining(String commentId);
}
