package com.chirp.server.repositories;

import com.chirp.server.models.CommunityLikePost;
import com.chirp.server.models.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommunityLikePostRepository extends MongoRepository<CommunityLikePost, String> {
	CommunityLikePost findByUserIdAndCommunityName(String userId , String communityName);

	boolean existsByUserIdAndCommunityNameAndPostIdsContaining(String userId , String communityName , String postId);

	List<CommunityLikePost> findByPostIdsContaining(String postId);
}