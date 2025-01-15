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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

	public Community createCommunity(String name , String ownerId , String description) {
		logger.info("Creating a new community with name: {}, ownerId: {}" , name , ownerId);
		communityRepository.findByName(name).ifPresent(community -> {
			throw new BadRequestException(String.format(COMMUNITY_EXISTS , name));
		});

		Community community = new Community(name , ownerId , description);
		community.setUserIds(List.of(ownerId));

		Community savedCommunity = communityRepository.save(community);
		logger.info("Community created successfully with ID: {}" , savedCommunity.getCommunityId());
		logActivity(ownerId , "Created community" , "Created community: " + name);
		return savedCommunity;
	}

//	@Cacheable(value = "communityPosts")
//	public CommunityPost createCommunityPost(String name , String ownerId , String content) {
//		Community community = getCommunityByName(name);
//
//		CommunityPost communityPost = CommunityPost.builder()
//				.ownerId(ownerId)
//				.communityName(name)
//				.content(content)
//				.createTime(LocalDateTime.now())
//				.comments(new ArrayList<>())
//				.likes(new ArrayList<>())
//				.deleted(false)
//				.build();
//
//		CommunityPost savedPost = communityPostRepository.save(communityPost);
//		community.getPostIds().add(savedPost.getId());
//		communityRepository.save(community);
//
//		logger.info("Post created with ID: {} for community: {}" , savedPost.getId() , name);
//		logActivity(ownerId , "Created post" , "Created a post in community: " + name);
//
//		return savedPost;
//	}

//	public CommunityLikePost likePostForCommunity(String userId , String postId , String communityName) {
//		logger.info("Processing like - userId: {}, postId: {}, community: {}" , userId , postId , communityName);
//		Community community = getCommunityByName(communityName);
//
//		validateUserAndPostInCommunity(userId , postId , communityName , community);
//
//		CommunityLikePost communityLikePost = communityLikePostRepository
//				.findByUserIdAndCommunityName(userId , communityName)
//				.orElseGet(() -> createNewCommunityLikePost(userId , communityName));
//
//		if (!communityLikePost.getPostIds().contains(postId)) {
//			communityLikePost.getPostIds().add(postId);
//			communityLikePostRepository.save(communityLikePost);
//			updateCommunityPostLikes(postId , userId);
//			logActivity(userId , "Liked post" , "Liked post in community: " + communityName);
//		}
//
//		return communityLikePost;
//	}

	@Cacheable(value = "communityUserCount")
	public int getUserCountForCommunity(String name) {
		logger.info("Fetching user count for community: {}" , name);
		try {
			return communityRepository.getUserCountForCommunity(name).orElse(0);
		} catch (Exception e) {
			logger.error("Error fetching user count for community {}: {}" , name , e.getMessage() , e);
			throw new InternalServerErrorException("Error fetching user count");
		}
	}

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

	@Cacheable(value = "communities", key = "#communityId")
	public Community getCommunityById(String communityId) {
		return communityRepository.findById(communityId)
				.orElseThrow(() -> new NotFoundException(String.format(COMMUNITY_NOT_FOUND , communityId)));
	}

	@Cacheable(value = "communities", key = "#name")
	public Community getCommunityByName(String name) {
		return communityRepository.findByName(name)
				.orElseThrow(() -> new NotFoundException(String.format(COMMUNITY_NOT_FOUND , name)));
	}

	@Cacheable(value = "userCommunities", key = "#userId")
	public List<Community> getCommunitiesByUserId(String userId) {
		logger.info("Fetching communities for user: {}" , userId);
		try {
			return communityRepository.findByUserIdsContaining(userId);
		} catch (Exception e) {
			logger.error("Error fetching communities for user {}: {}" , userId , e.getMessage() , e);
			throw new InternalServerErrorException("Error fetching communities");
		}
	}

	@Cacheable(value = "communityPosts", key = "#postId")
	public CommunityPost getCommunityPostById(String postId) {
		return communityPostRepository.findById(postId)
				.orElseThrow(() -> new NotFoundException(String.format(POST_NOT_FOUND , postId)));
	}

	@Cacheable(value = "allCommunities")
	public List<Community> getAllCommunities() {
		logger.info("Fetching all communities");
		return communityRepository.findAll();
	}

	@Cacheable(value = "allPosts")
	public List<CommunityPost> getAllDBPosts() {
		return communityPostRepository.findAll();
	}

	@Cacheable(value = "postLikes", key = "#postId")
	public int getLikesCountForPost(String postId) {
		return communityLikePostRepository.findByPostIdsContaining(postId).size();
	}

	private void validateUserAndPostInCommunity(String userId , String postId , String communityName , Community community) {
		if (!community.getUserIds().contains(userId)) {
			throw new BadRequestException(USER_NOT_IN_COMMUNITY);
		}

		if (!community.getPostIds().contains(postId)) {
			throw new BadRequestException(POST_NOT_IN_COMMUNITY);
		}

		if (communityLikePostRepository.existsByUserIdAndCommunityNameAndPostIdsContaining(userId , communityName , postId)) {
			throw new BadRequestException(ALREADY_LIKED);
		}
	}

//	private CommunityLikePost createNewCommunityLikePost(String userId , String communityName) {
//		return CommunityLikePost.builder()
//				.userId(userId)
//				.communityName(communityName)
//				.postIds(new ArrayList<>())
//				.createdAt(LocalDateTime.now())
//				.build();
//	}

	private void updateCommunityPostLikes(String postId , String userId) {
		communityPostRepository.findById(postId).ifPresent(post -> {
			Like newLike = new Like(userId);
			if (!post.getLikes().contains(newLike)) {
				post.getLikes().add(newLike);
				communityPostRepository.save(post);
				logger.info("Updated likes for postId: {}" , postId);
			}
		});
	}

	private void logActivity(String userId , String action , String description) {
		activityService.updateOrCreateActivity(userId , new ActivityModel.ActionType(List.of(action)) , description);
	}
}