package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.Community;
import com.chirp.server.models.CommunityPost;
import com.chirp.server.models.Like;
import com.chirp.server.repositories.CommunityPostRepository;
import com.chirp.server.repositories.CommunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
	private LikesService likeService;

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

	public Like likePostForCommunity(String userId , String postId) throws Exception {
		return likeService.likeEntity(userId , postId , true);
	}

	public Like likeCommentForCommunity(String userId , String commentId) throws Exception {
		return likeService.likeEntity(userId , commentId , false);
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