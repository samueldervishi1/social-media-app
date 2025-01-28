package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.*;
import com.chirp.server.repositories.CommunityPostRepository;
import com.chirp.server.repositories.CommunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommunityService {

	private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);
	private static final String COMMUNITY_NOT_FOUND = "Community with %s does not exist";
	private static final String POST_NOT_FOUND = "Post with ID %s does not exist";
	private static final String COMMUNITY_EXISTS = "Community with name %s already exists";

	private final CommunityRepository communityRepository;
	private final CommunityPostRepository communityPostRepository;

	public CommunityService(CommunityRepository communityRepository , CommunityPostRepository communityPostRepository) {
		this.communityRepository = communityRepository;
		this.communityPostRepository = communityPostRepository;
	}

	// Create community
	public Community createCommunity(String name , String ownerId , String description , List<Faq> faqs) {
		logger.info("Creating a new community with name: {}, ownerId: {}" , name , ownerId);

		communityRepository.findByName(name).ifPresent(community -> {
			throw new CustomException(400 , String.format(COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));
		community.setFaqs(faqs);

		Community savedCommunity = communityRepository.save(community);
		logger.info("Community created successfully with ID: {}" , savedCommunity.getCommunityId());
		return savedCommunity;
	}

	// Create post inside a community
	public CommunityPost createCommunityPost(String name , String ownerId , String description) {
		logger.info("Creating a post for community: {}, by user: {}" , name , ownerId);
		Community community = getCommunityByName(name);

		CommunityPost communityPost = new CommunityPost();
		communityPost.setOwnerId(ownerId);
		communityPost.setCommunityName(name);
		communityPost.setContent(description);
		communityPost.setCreateTime(LocalDateTime.now());
		communityPost.setComments(new ArrayList<>());
		communityPost.setDeleted(false);

		CommunityPost savedPost = communityPostRepository.save(communityPost);

		community.getPostIds().add(savedPost.getId());
		communityRepository.save(community);

		logger.info("Post created successfully with ID: {}, for community: {}" , savedPost.getId() , name);
		return savedPost;
	}

	// Get member count per community
	public int getUserCountForCommunity(String name) {
		logger.info("Fetching user count for community: {}" , name);
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
			logger.error("Error fetching user count for community {}: {}" , name , e.getMessage() , e);
			throw new CustomException(500 , "Error fetching user count");
		}
	}

	// Join community
	public void joinCommunity(String communityId , String userId) {
		logger.info("User {} joining community {}" , userId , communityId);
		Community community = getCommunityById(communityId);

		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
			logger.info("User {} joined community {}" , userId , communityId);
		}
	}

	// Get a community by ID
	public Community getCommunityById(String communityId) {
		return communityRepository.findById(communityId)
				.orElseThrow(() -> new CustomException(404 , String.format(COMMUNITY_NOT_FOUND , communityId)));
	}

	// Get community by name
	public Community getCommunityByName(String name) {
		return communityRepository.findByName(name)
				.orElseThrow(() -> new CustomException(404 , String.format(COMMUNITY_NOT_FOUND , name)));
	}

	// Get communities for the user from the user ID
	public List<Community> getCommunitiesByUserId(String userId) {
		logger.info("Fetching communities for user: {}" , userId);
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			logger.error("Error fetching communities for user {}: {}" , userId , e.getMessage() , e);
			throw new CustomException(500 , "Error fetching communities");
		}
	}

	// Get post for a community using post ID
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> new CustomException(404 , String.format(POST_NOT_FOUND , postId)));
	}

	// Fetch all communities from database
	public List<Community> getAllCommunities() {
		logger.info("Fetching all communities");
		return communityRepository.findAll();
	}

	// Fetch all posts from the database
	public List<CommunityPost> getAllDBPosts() {
		return communityPostRepository.findAll();
	}
}