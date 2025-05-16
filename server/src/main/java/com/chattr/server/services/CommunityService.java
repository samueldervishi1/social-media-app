package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.repositories.CommunityPostRepository;
import com.chattr.server.repositories.CommunityRepository;
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

	public CommunityService(CommunityRepository communityRepository , CommunityPostRepository communityPostRepository) {
		this.communityRepository = communityRepository;
		this.communityPostRepository = communityPostRepository;
	}

	/**
	 * Creates a new community with optional FAQs.
	 */
	public Community createCommunity(String name , String ownerId , String description , List<Faq> faqs) {
		communityRepository.findByName(name).ifPresent(existing -> {
			throw new CustomException(400 , String.format(Messages.COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));
		community.setFaqs(faqs);

		return communityRepository.save(community);
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

		return savedPost;
	}

	/**
	 * Updates community metadata, including name, description, and FAQs.
	 * Also updates community name in all related posts if renamed.
	 */
	public Community updateCommunity(String communityId , String newName , String description , List<Faq> faqs) {
		Community community = getCommunityById(communityId);

		// Handle name update
		if (newName != null && !newName.equals(community.getName())) {
			communityRepository.findByName(newName).ifPresent(existing -> {
				throw new CustomException(400 , String.format(Messages.COMMUNITY_EXISTS , newName));
			});

			String oldName = community.getName();
			community.setName(newName);

			List<CommunityPost> posts = communityPostRepository.findByCommunityName(oldName);
			for (CommunityPost post : posts) {
				post.setCommunityName(newName);
				communityPostRepository.save(post);
			}
		}

		if (description != null) {
			community.setDescription(description);
		}

		if (faqs != null && !faqs.isEmpty()) {
			community.setFaqs(faqs);
		}

		return communityRepository.save(community);
	}

	/**
	 * Returns the number of users in a given community.
	 */
	public int getUserCountForCommunity(String name) {
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
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
		}
	}

	/**
	 * Removes a user from a community. Throws if not a member.
	 */
	public void unjoinCommunity(String communityId , String userId) {
		Community community = getCommunityById(communityId);

		if (community.getUserIds().remove(userId)) {
			communityRepository.save(community);
		} else {
			throw new CustomException(400 , "User is not a member of this community.");
		}
	}

	/**
	 * Retrieves a community by ID, or throws 404.
	 */
	public Community getCommunityById(String communityId) {
		return communityRepository.findById(communityId)
				.orElseThrow(() -> new CustomException(404 , String.format(Messages.COMMUNITY_NOT_FOUND , communityId)));
	}

	/**
	 * Retrieves a community by name, or throws 404.
	 */
	public Community getCommunityByName(String name) {
		return communityRepository.findByName(name)
				.orElseThrow(() -> new CustomException(404 , String.format(Messages.COMMUNITY_NOT_FOUND , name)));
	}

	/**
	 * Fetches all communities where the user is a member.
	 */
	public List<Community> getCommunitiesByUserId(String userId) {
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			throw new CustomException(500 , "Error fetching communities");
		}
	}

	/**
	 * Fetches a post by its ID or throws 404.
	 */
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> new CustomException(404 , String.format(Messages.POST_NOT_FOUND , postId)));
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