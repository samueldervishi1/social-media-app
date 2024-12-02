package com.chirp.server.repositories;

import com.chirp.server.models.CommunityLikePost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityLikePostRepository extends MongoRepository<CommunityLikePost, String> {
	CommunityLikePost findByUserIdAndCommunityName(String userId , String communityName);

	boolean existsByUserIdAndCommunityNameAndPostIdsContaining(String userId , String communityName , String postId);
}