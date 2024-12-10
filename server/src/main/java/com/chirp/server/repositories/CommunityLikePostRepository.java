package com.chirp.server.repositories;

import com.chirp.server.models.CommunityLikePost;
import com.chirp.server.models.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityLikePostRepository extends MongoRepository<CommunityLikePost, String> {
	Optional<CommunityLikePost> findByUserIdAndCommunityName(String userId , String communityName);

	boolean existsByUserIdAndCommunityNameAndPostIdsContaining(String userId , String communityName , String postId);

	List<CommunityLikePost> findByPostIdsContaining(String postId);
}