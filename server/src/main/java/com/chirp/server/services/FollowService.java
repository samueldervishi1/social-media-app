package com.chirp.server.services;

import com.chirp.server.exceptions.BadRequestException;
import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.FollowerDTO;
import com.chirp.server.repositories.FollowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class FollowService {

	private static final Logger logger = LoggerFactory.getLogger(FollowService.class);

	private final FollowRepository followRepository;

	public FollowService(FollowRepository followRepository) {
		this.followRepository = followRepository;
	}

	@Transactional
	public void followUser(String followerId , String followingId) {
		try {
			logger.info("Attempting to follow: {} by {}" , followingId , followerId);

			FollowerDTO followerDTO = followRepository.findByUserId(followerId)
					.orElseGet(() -> new FollowerDTO(followerId));
			if (!followerDTO.getFollowingId().contains(followingId)) {
				followerDTO.getFollowingId().add(followingId);
				followRepository.save(followerDTO);
				logger.info("{} started following {}" , followerId , followingId);
			} else {
				logger.warn("{} is already following {}" , followerId , followingId);
			}

			FollowerDTO followingDTO = followRepository.findByUserId(followingId)
					.orElseGet(() -> new FollowerDTO(followingId));
			if (!followingDTO.getFollowerId().contains(followerId)) {
				followingDTO.getFollowerId().add(followerId);
				followRepository.save(followingDTO);
				logger.info("{} followed by {}" , followingId , followerId);
			}
		} catch (Exception e) {
			logger.error("Error following user: {} by {}. Error: {}" , followingId , followerId , e.getMessage() , e);
			throw new InternalServerErrorException("An error occurred while following the user");
		}
	}

	@Transactional
	public void unfollowUser(String followerId , String followingId) {
		try {
			logger.info("Attempting to unfollow: {} by {}" , followingId , followerId);

			FollowerDTO followerDTO = followRepository.findByUserId(followerId)
					.orElseThrow(() -> new NotFoundException("Follower user not found: " + followerId));
			if (followerDTO.getFollowingId().remove(followingId)) {
				followRepository.save(followerDTO);
				logger.info("{} unfollowed {}" , followerId , followingId);
			} else {
				throw new BadRequestException("User " + followerId + " is not following " + followingId);
			}

			followRepository.findByUserId(followingId).ifPresent(followingDTO -> {
				if (followingDTO.getFollowerId().remove(followerId)) {
					followRepository.save(followingDTO);
					logger.info("{} removed from followers of {}" , followerId , followingId);
				}
			});
		} catch (BadRequestException | NotFoundException e) {
			logger.warn("Error in unfollowing user: {} by {}. Error: {}" , followingId , followerId , e.getMessage() , e);
			throw e;
		} catch (Exception e) {
			logger.error("Unexpected error while unfollowing user: {} by {}. Error: {}" , followingId , followerId , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while unfollowing the user");
		}
	}

	public FollowerDTO getUserConnections(String userId) {
		return followRepository.findByUserId(userId)
				.orElseThrow(() -> new NotFoundException("User connections not found for: " + userId));
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
}
