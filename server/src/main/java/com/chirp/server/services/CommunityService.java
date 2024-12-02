package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.*;
import com.chirp.server.repositories.CommunityLikePostRepository;
import com.chirp.server.repositories.CommunityPostRepository;
import com.chirp.server.repositories.CommunityRepository;
import com.chirp.server.repositories.LikesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

	private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

	@Autowired
	private CommunityRepository communityRepository;

	@Autowired
	private CommunityPostRepository communityPostRepository;

	@Autowired
	private CommunityLikePostRepository communityLikePostRepository;

	private CommunityPost createPostForCommunity(String ownerId , String content , String communityName) {
		CommunityPost post = new CommunityPost();
		post.setOwnerId(ownerId);
		post.setCommunityName(communityName);
		post.setContent(content);
		post.setCreateTime(LocalDateTime.now());
		post.setComments(new ArrayList<>());
		post.setLikes(new ArrayList<>());
		post.setDeleted(false);
		return post;
	}

	public Community createCommunity(String name , String ownerId , String description) {
		logger.info("Creating a new community with name: {}, ownerId: {}" , name , ownerId);
		if (communityRepository.findByName(name).isPresent()) {
			throw new IllegalArgumentException("Community with name " + name + " already exists");
		}

		Community community = new Community(name , ownerId , description);
		Community savedCommunity = communityRepository.save(community);
		logger.info("Community with name {} successfully created with ID: {}" , name , savedCommunity.getCommunityId());
		return savedCommunity;
	}

	public CommunityPost createCommunityPost(String name , String ownerId , String content) {
		logger.info("Creating a post for community: {}, by user: {}" , name , ownerId);
		Community community = getEntityByIdOrName(name , communityRepository.findByName(name));
		CommunityPost post = createPostForCommunity(ownerId , content , name);

		CommunityPost savedPost = communityPostRepository.save(post);
		logger.info("Post successfully created with ID: {} for community: {}" , savedPost.getId() , name);

		community.getPostIds().add(savedPost.getId());
		communityRepository.save(community);
		logger.info("Post ID {} added to community {}" , savedPost.getId() , name);
		return savedPost;
	}

	public CommunityLikePost likePostForCommunity(String userId , String postId , String communityName) throws Exception {
		logger.info("Starting the like process for userId: {} and postId: {} in community: {}" , userId , postId , communityName);

		Optional<Community> communityOptional = communityRepository.findByName(communityName);
		if (communityOptional.isEmpty()) {
			logger.error("Community with name: {} not found." , communityName);
			throw new Exception("Community does not exist");
		}
		logger.info("Community with name: {} found." , communityName);

		Community community = communityOptional.get();

		if (!community.getUserIds().contains(userId)) {
			logger.warn("User with userId: {} is not part of the community: {}" , userId , communityName);
			throw new Exception("User is not part of the community");
		}
		logger.info("User with userId: {} is part of the community: {}" , userId , communityName);

		if (!community.getPostIds().contains(postId)) {
			logger.error("Post with postId: {} does not exist in community: {}" , postId , communityName);
			throw new Exception("Post does not exist in the community");
		}
		logger.info("Post with postId: {} exists in the community: {}" , postId , communityName);

		if (communityLikePostRepository.existsByUserIdAndCommunityNameAndPostIdsContaining(userId , communityName , postId)) {
			logger.warn("User with userId: {} has already liked post with postId: {} in community: {}" , userId , postId , communityName);
			throw new Exception("User has already liked the post in the community");
		}

		CommunityLikePost communityLikePost = communityLikePostRepository.findByUserIdAndCommunityName(userId , communityName);
		if (communityLikePost == null) {
			communityLikePost = new CommunityLikePost();
			communityLikePost.setUserId(userId);
			communityLikePost.setCommunityName(communityName);
			communityLikePost.setPostIds(new ArrayList<>());
			communityLikePost.setCreatedAt(LocalDateTime.now());
		}

		List<String> postIds = communityLikePost.getPostIds();
		postIds.add(postId);
		communityLikePost.setPostIds(postIds);

		communityLikePostRepository.save(communityLikePost);
		logger.info("New like added for userId: {} and postId: {} in community: {}" , userId , postId , communityName);

		Optional<CommunityPost> communityPostOptional = communityPostRepository.findById(postId);
		if (communityPostOptional.isPresent()) {
			CommunityPost communityPost = communityPostOptional.get();
			List<Like> likes = communityPost.getLikes();

			Like newPostLike = new Like();
			newPostLike.setUserId(userId);

			if (!likes.contains(newPostLike)) {
				likes.add(newPostLike);
				communityPost.setLikes(likes);
				communityPostRepository.save(communityPost);
				logger.info("Updated the likes array in the communityPost for postId: {}" , postId);
			} else {
				logger.warn("User with userId: {} has already liked post with postId: {} in the community post's likes array." , userId , postId);
			}
		} else {
			logger.error("CommunityPost with postId: {} not found." , postId);
			throw new Exception("Post does not exist in the communityPost collection");
		}

		return communityLikePost;
	}

	public int getUserCountForCommunity(String name) {
		logger.info("Fetching user count for community: {}" , name);
		try {
			List<Community> communities = communityRepository.findByNameContaining(name);
			if (communities.isEmpty()) {
				logger.info("No communities found matching name: {}" , name);
				return 0;
			}

			Community community = communities.get(0);
			int userCount = (community.getUserIds() != null) ? community.getUserIds().size() : 0;
			logger.info("User count for community {}: {}" , name , userCount);
			return userCount;
		} catch (Exception e) {
			logger.error("Error fetching user count for community {}: {}" , name , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching user count.");
		}
	}

	public void joinCommunity(String communityId , String userId) {
		logger.info("User {} attempting to join community {}" , userId , communityId);
		Community community = getEntityByIdOrName(communityId , communityRepository.findById(communityId));

		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
			logger.info("User {} successfully joined community {}" , userId , communityId);
		} else {
			logger.info("User {} is already a member of community {}" , userId , communityId);
		}
	}

	public Community getCommunityById(String communityId) {
		return getEntityByIdOrName(communityId , communityRepository.findById(communityId));
	}

	public Community getCommunityByName(String name) {
		return getEntityByIdOrName(name , communityRepository.findByName(name));
	}

	public List<Community> getCommunitiesByUserId(String userId) {
		logger.info("Fetching communities for user: {}" , userId);
		try {
			List<Community> communities = communityRepository.findByUserIdsContaining(userId);
			logger.info("Found {} communities for user {}" , communities.size() , userId);
			return communities;
		} catch (Exception e) {
			logger.error("Error fetching communities for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching communities.");
		}
	}

	public CommunityPost getCommunityPostById(String postId) {
		logger.info("Fetching post with ID: {}" , postId);
		Optional<CommunityPost> postOptional = communityPostRepository.findById(postId);

		if (postOptional.isEmpty()) {
			logger.warn("Post with ID: {} not found" , postId);
			throw new IllegalArgumentException("Post with ID " + postId + " does not exist");
		}

		logger.info("Post with ID: {} successfully retrieved" , postId);
		return postOptional.get();
	}

	public List<Community> getAllCommunities() {
		logger.info("Fetching all communities");
		List<Community> communities = communityRepository.findAll();
		logger.info("Retrieved {} communities" , communities.size());
		return communities;
	}

	public List<CommunityPost> getAllDBPosts() {
		List<CommunityPost> posts = communityPostRepository.findAll();
		posts.forEach(post -> logger.info("Fetched post with date: {}" , post.getCreateTime()));
		return posts;
	}

	private void logAndThrowNotFound(String identifier) {
		logger.warn("{} with {} does not exist" , "Community" , identifier);
		throw new IllegalArgumentException("Community" + " with " + identifier + " does not exist");
	}

	private <T> T getEntityByIdOrName(String identifier , Optional<T> entity) {
		if (entity.isEmpty()) {
			logAndThrowNotFound(identifier);
		}
		logger.info("{} with {} successfully retrieved" , "Community" , identifier);
		return entity.get();
	}
}