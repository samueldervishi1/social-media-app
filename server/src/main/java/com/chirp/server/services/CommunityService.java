package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.models.*;
import com.chirp.server.repositories.CommunityLikePostRepository;
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
	private static final String USER_NOT_IN_COMMUNITY = "User is not part of the community";
	private static final String POST_NOT_IN_COMMUNITY = "Post does not exist in the community";
	private static final String ALREADY_LIKED = "User has already liked the post in the community";

	private final CommunityRepository communityRepository;
	private final CommunityPostRepository communityPostRepository;
	private final CommunityLikePostRepository communityLikePostRepository;
	private final ActivityService activityService;

	public CommunityService(CommunityRepository communityRepository , CommunityPostRepository communityPostRepository ,
	                        CommunityLikePostRepository communityLikePostRepository , ActivityService activityService) {
		this.communityRepository = communityRepository;
		this.communityPostRepository = communityPostRepository;
		this.communityLikePostRepository = communityLikePostRepository;
		this.activityService = activityService;
	}

	//create community
	public Community createCommunity(String name , String ownerId , String description , List<Faq> faqs) {
		logger.info("Creating a new community with name: {}, ownerId: {}" , name , ownerId);

		communityRepository.findByName(name).ifPresent(community -> {
			throw new BadRequestException(String.format(COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));
		community.setFaqs(faqs);

		Community savedCommunity = communityRepository.save(community);
		logger.info("Community created successfully with ID: {}" , savedCommunity.getCommunityId());

		logActivity(ownerId , "Created community" , "Created community: " + name);
		return savedCommunity;
	}

	//create post inside a community
	public CommunityPost createCommunityPost(String name , String ownerId , String description) {
		logger.info("Creating a post for community: {}, by user: {}" , name , ownerId);
		Community community = getCommunityByName(name);

		CommunityPost communityPost = new CommunityPost();
		communityPost.setOwnerId(ownerId);
		communityPost.setCommunityName(name);
		communityPost.setContent(description);
		communityPost.setCreateTime(LocalDateTime.now());
		communityPost.setComments(new ArrayList<>());
		communityPost.setLikes(new ArrayList<>());
		communityPost.setDeleted(false);

		CommunityPost savedPost = communityPostRepository.save(communityPost);

		community.getPostIds().add(savedPost.getId());
		communityRepository.save(community);

		logger.info("Post created successfully with ID: {}, for community: {}" , savedPost.getId() , name);
		logActivity(ownerId , "Created post" , "Created a post in community:" + name);
		return savedPost;
	}

	//like post in community
	public CommunityLikePost likePost(String userId , String postId , String communityName) {
		logger.info("Liking a post with ID: {}, community: {} " , postId , communityName);

		Community community = getCommunityByName(communityName);
		validateUserInCommunity(userId , community);
		validatePostInCommunity(postId , community);

		CommunityLikePost communityLikePost = communityLikePostRepository
				.findByUserIdAndCommunityName(userId , communityName)
				.orElseGet(() -> createNewCommunityLikePost(userId , communityName));

		if (communityLikePost.getPostIds().contains(postId)) {
			throw new BadRequestException("You have already liked this post.");
		}

		communityLikePost.getPostIds().add(postId);
		communityLikePostRepository.save(communityLikePost);
		updateCommunityPostLikes(postId , userId);

		logger.info("User {} liked post {} in community {}" , userId , postId , communityName);
		logActivity(userId , "Liked post" , "Liked a post in community: " + communityName);

		return communityLikePost;
	}

	private CommunityLikePost createNewCommunityLikePost(String userId , String communityName) {
		CommunityLikePost likePost = new CommunityLikePost();
		likePost.setUserId(userId);
		likePost.setCommunityName(communityName);
		likePost.setPostIds(new ArrayList<>());
		likePost.setCreatedAt(LocalDateTime.now());
		return communityLikePostRepository.save(likePost);
	}

	private void updateCommunityPostLikes(String postId , String userId) {
		communityPostRepository.findById(postId).ifPresentOrElse(post -> {
			Like newLike = new Like(userId);
			if (!post.getLikes().contains(newLike)) {
				post.getLikes().add(newLike);
				communityPostRepository.save(post);
				logger.info("Updated likes for postId: {}" , postId);
			}
		} , () -> {
			throw new NotFoundException(String.format("Post with ID %s not found" , postId));
		});
	}

	//get member count per community
	public int getUserCountForCommunity(String name) {
		logger.info("Fetching user count for community: {}" , name);
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
			logger.error("Error fetching user count for community {}: {}" , name , e.getMessage() , e);
			throw new InternalServerErrorException("Error fetching user count");
		}
	}

	//join community
	public void joinCommunity(String communityId , String userId) {
		logger.info("User {} joining community {}" , userId , communityId);
		Community community = getCommunityById(communityId);

		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
			logger.info("User {} joined community {}" , userId , communityId);
			logActivity(userId , "Joined community" , "Joined community: " + communityId);
		}
	}

	//get a community by ID
	public Community getCommunityById(String communityId) {
		return communityRepository.findById(communityId)
				.orElseThrow(() -> new NotFoundException(String.format(COMMUNITY_NOT_FOUND , communityId)));
	}

	//get community by name
	public Community getCommunityByName(String name) {
		return communityRepository.findByName(name)
				.orElseThrow(() -> new NotFoundException(String.format(COMMUNITY_NOT_FOUND , name)));
	}

	//get communities for the user from the user ID
	public List<Community> getCommunitiesByUserId(String userId) {
		logger.info("Fetching communities for user: {}" , userId);
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			logger.error("Error fetching communities for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("Error fetching communities");
		}
	}

	//get post for a community using post ID
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> new NotFoundException(String.format(POST_NOT_FOUND , postId)));
	}

	//fetch all communities from database
	public List<Community> getAllCommunities() {
		logger.info("Fetching all communities");
		return communityRepository.findAll();
	}

	public List<CommunityPost> getAllDBPosts() {
		return communityPostRepository.findAll();
	}

	//get likes count per post in community
	public int getLikesCountForPost(String postId) {
		return communityLikePostRepository.findByPostIdsContaining(postId).size();
	}

	private void validateUserInCommunity(String userId , Community community) {
		if (!community.getUserIds().contains(userId)) {
			throw new BadRequestException("User is not part of the community.");
		}
	}

	private void validatePostInCommunity(String postId , Community community) {
		if (!community.getPostIds().contains(postId)) {
			throw new BadRequestException("Post does not exist in the community.");
		}
	}

	private void logActivity(String userId , String action , String description) {
		activityService.updateOrCreateActivity(userId , new ActivityModel.ActionType(List.of(action)) , description);
	}
}