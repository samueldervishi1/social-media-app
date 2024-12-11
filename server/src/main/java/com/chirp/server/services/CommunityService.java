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

	private final CommunityRepository communityRepository;
	private final CommunityPostRepository communityPostRepository;
	private final CommunityLikePostRepository communityLikePostRepository;

	public CommunityService(CommunityRepository communityRepository , CommunityPostRepository communityPostRepository , CommunityLikePostRepository communityLikePostRepository) {
		this.communityRepository = communityRepository;
		this.communityPostRepository = communityPostRepository;
		this.communityLikePostRepository = communityLikePostRepository;
	}

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
		communityRepository.findByName(name).ifPresent(community -> {
			throw new IllegalArgumentException("Community with name " + name + " already exists");
		});

		Community community = new Community(name , ownerId , description);
		Community savedCommunity = communityRepository.save(community);
		logger.info("Community created successfully with ID: {}" , savedCommunity.getCommunityId());
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
		Community community = getEntityByIdOrName(communityName , communityRepository.findByName(communityName));

		validateUserAndPostInCommunity(userId , postId , communityName , community);

		CommunityLikePost communityLikePost = communityLikePostRepository
				.findByUserIdAndCommunityName(userId , communityName)
				.orElseGet(() -> createNewCommunityLikePost(userId , communityName));

		if (!communityLikePost.getPostIds().contains(postId)) {
			communityLikePost.getPostIds().add(postId);
			communityLikePostRepository.save(communityLikePost);
		}

		updateCommunityPostLikes(postId , userId);

		return communityLikePost;
	}

	private void validateUserAndPostInCommunity(String userId , String postId , String communityName , Community community) throws Exception {
		if (!community.getUserIds().contains(userId)) {
			logger.warn("User {} is not part of the community: {}" , userId , communityName);
			throw new Exception("User is not part of the community");
		}

		if (!community.getPostIds().contains(postId)) {
			logger.error("Post {} does not exist in community: {}" , postId , communityName);
			throw new Exception("Post does not exist in the community");
		}

		if (communityLikePostRepository.existsByUserIdAndCommunityNameAndPostIdsContaining(userId , communityName , postId)) {
			logger.warn("User {} has already liked post {} in community {}" , userId , postId , communityName);
			throw new Exception("User has already liked the post in the community");
		}
	}

	private CommunityLikePost createNewCommunityLikePost(String userId , String communityName) {
		CommunityLikePost communityLikePost = new CommunityLikePost();
		communityLikePost.setUserId(userId);
		communityLikePost.setCommunityName(communityName);
		communityLikePost.setPostIds(new ArrayList<>());
		communityLikePost.setCreatedAt(LocalDateTime.now());
		return communityLikePost;
	}

	private void updateCommunityPostLikes(String postId , String userId) {
		communityPostRepository.findById(postId).ifPresent(post -> {
			Like newPostLike = new Like();
			newPostLike.setUserId(userId);
			if (!post.getLikes().contains(newPostLike)) {
				post.getLikes().add(newPostLike);
				communityPostRepository.save(post);
				logger.info("Updated the likes for postId: {}" , postId);
			} else {
				logger.warn("User {} has already liked post {}" , userId , postId);
			}
		});
	}

	public int getUserCountForCommunity(String name) {
		logger.info("Fetching user count for community: {}" , name);
		try {
			Optional<Integer> userCount = communityRepository.getUserCountForCommunity(name);
			return userCount.orElse(0);
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
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			logger.error("Error fetching communities for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching communities.");
		}
	}

	public CommunityPost getCommunityPostById(String postId) {
		logger.info("Fetching post with ID: {}" , postId);
		return communityPostRepository.findById(postId).orElseThrow(() -> {
			logger.warn("Post with ID: {} not found" , postId);
			return new IllegalArgumentException("Post with ID " + postId + " does not exist");
		});
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

	public int getLikesCountForPost(String postId) {
		return getCountForEntity(communityLikePostRepository.findByPostIdsContaining(postId) , postId);
	}

	private int getCountForEntity(List<CommunityLikePost> likes , String entityId) {
		int count = likes.size();
		logger.info("Like count for post with ID {}: {}" , entityId , count);
		return count;
	}

	private <T> T getEntityByIdOrName(String identifier , Optional<T> entity) {
		return entity.orElseThrow(() -> {
			logger.warn("{} with {} does not exist" , "Community" , identifier);
			return new IllegalArgumentException("Community with " + identifier + " does not exist");
		});
	}
}