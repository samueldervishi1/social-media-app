package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.FollowerDTO;
import com.chirp.server.repositories.FollowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FollowService {

	private static final Logger logger = LoggerFactory.getLogger(FollowService.class);
	private static final String USER_NOT_FOUND = "User connections not found for: ";
	private static final String FOLLOW_ERROR = "An error occurred while following the user";
	private static final String UNFOLLOW_ERROR = "An unexpected error occurred while unfollowing the user";

	private final FollowRepository followRepository;
	private final ActivityService activityService;

	public FollowService(FollowRepository followRepository , ActivityService activityService) {
		this.followRepository = followRepository;
		this.activityService = activityService;
	}

	@Transactional
	public void followUser(String followerId , String followingId) {
		try {
			logger.info("Attempting to follow: {} by {}" , followingId , followerId);

			FollowerDTO followerDTO = getOrCreateFollowerDTO(followerId);
			if (followerDTO.getFollowingId().add(followingId)) {
				followRepository.save(followerDTO);
				logger.info("{} started following {}" , followerId , followingId);
				createFollowActivity(followerId , followingId , true);
			}

			FollowerDTO followingDTO = getOrCreateFollowerDTO(followingId);
			if (followingDTO.getFollowerId().add(followerId)) {
				followRepository.save(followingDTO);
				logger.info("{} followed by {}" , followingId , followerId);
			}
		} catch (Exception e) {
			logger.error("Error following user: {} by {}. Error: {}" , followingId , followerId , e.getMessage() , e);
			throw new InternalServerErrorException(FOLLOW_ERROR);
		}
	}

	@Transactional
	public void unfollowUser(String followerId , String followingId) {
		try {
			logger.info("Attempting to unfollow: {} by {}" , followingId , followerId);

			FollowerDTO followerDTO = followRepository.findByUserId(followerId)
					.orElseThrow(() -> new NotFoundException(USER_NOT_FOUND + followerId));

			if (followerDTO.getFollowingId().remove(followingId)) {
				followRepository.save(followerDTO);
				logger.info("{} unfollowed {}" , followerId , followingId);
				createFollowActivity(followerId , followingId , false);
			} else {
				throw new BadRequestException("User " + followerId + " is not following " + followingId);
			}

			removeFollower(followerId , followingId);
		} catch (BadRequestException | NotFoundException e) {
			logger.warn("Error in unfollowing user: {} by {}. Error: {}" , followingId , followerId , e.getMessage());
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while unfollowing user: {} by {}. Error: {}" , followingId , followerId , e.getMessage());
			throw new InternalServerErrorException(UNFOLLOW_ERROR);
		}
	}

	public FollowerDTO getUserConnections(String userId) {
		return followRepository.findByUserId(userId)
				.orElseThrow(() -> new NotFoundException(USER_NOT_FOUND + userId));
	}

	public int getUserFollowersCount(String userId) {
		return followRepository.findByUserId(userId)
				.map(followerDTO -> followerDTO.getFollowerId().size())
				.orElse(0);
	}

	public int getUserFollowingCount(String userId) {
		return followRepository.findByUserId(userId)
				.map(followerDTO -> followerDTO.getFollowingId().size())
				.orElse(0);
	}

	private FollowerDTO getOrCreateFollowerDTO(String userId) {
		return followRepository.findByUserId(userId)
				.orElseGet(() -> new FollowerDTO(userId));
	}

	private void createFollowActivity(String followerId , String followingId , boolean isFollow) {
		String action = isFollow ? "Followed user" : "Unfollowed user";
		String message = (isFollow ? "Started following user: " : "Unfollowed user: ") + followingId;
		activityService.updateOrCreateActivity(
				followerId ,
				new ActivityModel.ActionType(List.of(action)) ,
				message
		);
	}

	private void removeFollower(String followerId , String followingId) {
		followRepository.findByUserId(followingId).ifPresent(followingDTO -> {
			if (followingDTO.getFollowerId().remove(followerId)) {
				followRepository.save(followingDTO);
				logger.info("{} removed from followers of {}" , followerId , followingId);
			}
		});
	}
}