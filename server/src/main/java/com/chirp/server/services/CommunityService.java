package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.*;
import com.chirp.server.repositories.CommunityPostRepository;
import com.chirp.server.repositories.CommunityRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommunityService {

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
		communityRepository.findByName(name).ifPresent(community -> {
			throw new CustomException(400 , String.format(COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));
		community.setFaqs(faqs);

		return communityRepository.save(community);
	}

	// Create post inside a community
	public CommunityPost createCommunityPost(String name , String ownerId , String description) {
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
		return savedPost;
	}

	// Get member count per community
	@Cacheable(value = "communityUserCounts", key = "#name")
	public int getUserCountForCommunity(String name) {
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
			throw new CustomException(500 , "Error fetching user count");
		}
	}

	// Join community
	public void joinCommunity(String communityId , String userId) {
		Community community = getCommunityById(communityId);
		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
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
	@Cacheable(value = "userCommunities", key = "#userId")
	public List<Community> getCommunitiesByUserId(String userId) {
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			throw new CustomException(500 , "Error fetching communities");
		}
	}

	// Get post for a community using post ID
	@Cacheable(value = "communityPosts", key = "#postId")
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> new CustomException(404 , String.format(POST_NOT_FOUND , postId)));
	}

	// Fetch all communities from database
	@Cacheable(value = "allCommunities")
	public List<Community> getAllCommunities() {
		return communityRepository.findAll();
	}

	// Fetch all posts from the database
	@Cacheable(value = "allCommunityPosts")
	public List<CommunityPost> getAllDBPosts() {
		return communityPostRepository.findAll();
	}
}