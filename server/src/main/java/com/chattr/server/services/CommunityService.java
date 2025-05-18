package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.repositories.CommunityPostRepository;
import com.chattr.server.repositories.CommunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing communities and community posts.
 * Handles creation, updates, joining/unjoining, and retrieval.
 */
@Service
public class CommunityService {

	private final CommunityRepository communityRepository;
	private final CommunityPostRepository communityPostRepository;
	private static final Logger LOGGER = LoggerFactory.getLogger(CommunityService.class);

	public CommunityService(CommunityRepository communityRepository , CommunityPostRepository communityPostRepository) {
		this.communityRepository = communityRepository;
		this.communityPostRepository = communityPostRepository;
	}

	/**
	 * Creates a new community with optional FAQs.
	 */
	public Community createCommunity(String name , String ownerId , String description , List<Faq> faqs) {
		communityRepository.findByName(name).ifPresent(existing -> {
			LOGGER.warn("Community creation failed: name '{}' already exists" , name);
			throw new CustomException(400 , String.format(Messages.COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));
		community.setFaqs(faqs);

		Community created = communityRepository.save(community);
		LOGGER.info("Community created: name='{}', ownerId='{}'" , name , ownerId);
		return created;
	}

	/**
	 * Creates a new post inside a specific community.
	 */
	public CommunityPost createCommunityPost(String name , String ownerId , String description) {
		Community community = getCommunityByName(name);

		CommunityPost post = new CommunityPost();
		post.setOwnerId(ownerId);
		post.setCommunityName(name);
		post.setContent(description);
		post.setCreateTime(LocalDateTime.now());
		post.setComments(new ArrayList<>());
		post.setDeleted(false);

		CommunityPost savedPost = communityPostRepository.save(post);
		community.getPostIds().add(savedPost.getId());
		communityRepository.save(community);

		LOGGER.info("Post created for community '{}', postId='{}'" , name , savedPost.getId());
		return savedPost;
	}

	/**
	 * Updates community metadata, including name, description, and FAQs.
	 */
	public Community updateCommunity(String communityId , String newName , String description , List<Faq> faqs) {
		Community community = getCommunityById(communityId);

		if (newName != null && !newName.equals(community.getName())) {
			communityRepository.findByName(newName).ifPresent(existing -> {
				LOGGER.warn("Community rename failed: '{}' already exists" , newName);
				throw new CustomException(400 , String.format(Messages.COMMUNITY_EXISTS , newName));
			});

			String oldName = community.getName();
			community.setName(newName);

			List<CommunityPost> posts = communityPostRepository.findByCommunityName(oldName);
			for (CommunityPost post : posts) {
				post.setCommunityName(newName);
				communityPostRepository.save(post);
			}

			LOGGER.info("Community '{}' renamed to '{}'" , oldName , newName);
		}

		if (description != null) {
			community.setDescription(description);
		}

		if (faqs != null && !faqs.isEmpty()) {
			community.setFaqs(faqs);
		}

		Community updated = communityRepository.save(community);
		LOGGER.info("Community updated: id='{}'" , communityId);
		return updated;
	}

	/**
	 * Returns the number of users in a given community.
	 */
	public int getUserCountForCommunity(String name) {
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
			LOGGER.error("Failed to retrieve user count for community '{}': {}" , name , e.getMessage());
			throw new CustomException(500 , "Error fetching user count");
		}
	}

	/**
	 * Adds a user to the community member list if not already present.
	 */
	public void joinCommunity(String communityId , String userId) {
		Community community = getCommunityById(communityId);

		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
			LOGGER.info("User '{}' joined community '{}'" , userId , communityId);
		} else {
			LOGGER.info("User '{}' is already a member of community '{}'" , userId , communityId);
		}
	}

	/**
	 * Removes a user from a community. Throws if not a member.
	 */
	public void leaveCommunity(String communityId , String userId) {
		Community community = getCommunityById(communityId);

		if (community.getUserIds().remove(userId)) {
			communityRepository.save(community);
			LOGGER.info("User '{}' left community '{}'" , userId , communityId);
		} else {
			LOGGER.warn("User '{}' attempted to leave community '{}' but was not a member" , userId , communityId);
			throw new CustomException(400 , "User is not a member of this community.");
		}
	}

	/**
	 * Retrieves a community by ID, or throws 404.
	 */
	public Community getCommunityById(String communityId) {
		return communityRepository.findById(communityId)
				.orElseThrow(() -> {
					LOGGER.warn("Community not found by ID: {}" , communityId);
					return new CustomException(404 , String.format(Messages.COMMUNITY_NOT_FOUND , communityId));
				});
	}

	/**
	 * Retrieves a community by name, or throws 404.
	 */
	public Community getCommunityByName(String name) {
		return communityRepository.findByName(name)
				.orElseThrow(() -> {
					LOGGER.warn("Community not found by name: {}" , name);
					return new CustomException(404 , String.format(Messages.COMMUNITY_NOT_FOUND , name));
				});
	}

	/**
	 * Fetches all communities where the user is a member.
	 */
	public List<Community> getCommunitiesByUserId(String userId) {
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			LOGGER.error("Error fetching communities for user '{}': {}" , userId , e.getMessage());
			throw new CustomException(500 , "Error fetching communities");
		}
	}

	/**
	 * Fetches a post by its ID or throws 404.
	 */
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> {
					LOGGER.warn("Community post not found by ID: {}" , postId);
					return new CustomException(404 , String.format(Messages.POST_NOT_FOUND , postId));
				});
	}

	/**
	 * Returns all communities in the system.
	 */
	public List<Community> getAllCommunities() {
		return communityRepository.findAll();
	}

	/**
	 * Returns all posts from all communities.
	 */
	public List<CommunityPost> getAllDBPosts() {
		return communityPostRepository.findAll();
	}
}