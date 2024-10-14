package org.server.socialapp.services;

import org.server.socialapp.exceptions.BadRequestException;
import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.models.FollowerDTO;
import org.server.socialapp.repositories.ActivityRepository;
import org.server.socialapp.repositories.FollowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
public class FollowService {

    private static final Logger logger = LoggerFactory.getLogger(FollowService.class);

    @Autowired
    private FollowRepository followRepository;
    @Autowired
    private ActivityRepository activityRepository;

    public void followUser(String followerId, String followingId) {
        try {
            logger.info("Attempting to follow: {} by {}", followingId, followerId);

            FollowerDTO followerDTO = followRepository.findByUserId(followerId);
            if (followerDTO == null) {
                followerDTO = new FollowerDTO(followerId);
            }

            List<String> followingIds = followerDTO.getFollowingId();
            if (!followingIds.contains(followingId)) {
                followingIds.add(followingId);
                followRepository.save(followerDTO);
                logger.info("{} started following {}", followerId, followingId);

                String activityDescription = followerId + "followed user with id " + followingId;
                List<ActivityModel> existingActivities = activityRepository.findByUserId(followerId);

                if (!existingActivities.isEmpty()) {
                    for (ActivityModel activity : existingActivities) {
                        activity.getActionType().getAllActivity().add(activityDescription);
                        activityRepository.save(activity);
                    }
                } else {
                    ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                    ActivityModel activity = new ActivityModel(actionType, followerDTO.getId(), Instant.now(), "active");
                    activityRepository.save(activity);
                }
            } else {
                logger.warn("{} is already following {}", followerId, followingId);
            }

            FollowerDTO followingDTO = followRepository.findByUserId(followingId);
            if (followingDTO == null) {
                followingDTO = new FollowerDTO(followingId);
            }

            List<String> followerIds = followingDTO.getFollowerId();
            if (!followerIds.contains(followerId)) {
                followerIds.add(followerId);
                followRepository.save(followingDTO);
                logger.info("{} followed by {}", followingId, followerId);
            }
        } catch (Exception e) {
            logger.error("Error following user: {} by {}. Error: {}", followingId, followerId, e.getMessage(), e);
            throw new InternalServerErrorException("An error occurred while following the user");
        }
    }

    public void unfollowUser(String followerId, String followingId) {
        try {
            logger.info("Attempting to unfollow: {} by {}", followingId, followerId);

            FollowerDTO followerDTO = followRepository.findByUserId(followerId);
            if (followerDTO != null) {
                List<String> followingIds = followerDTO.getFollowingId();
                if (followingIds.contains(followingId)) {
                    followingIds.remove(followingId);
                    followRepository.save(followerDTO);
                    logger.info("{} unfollowed {}", followerId, followingId);
                } else {
                    throw new BadRequestException("User " + followerId + " is not following " + followingId);
                }
            } else {
                throw new NotFoundException("Follower user not found: " + followerId);
            }

            FollowerDTO followingDTO = followRepository.findByUserId(followingId);
            if (followingDTO != null) {
                List<String> followerIds = followingDTO.getFollowerId();
                if (followerIds.contains(followerId)) {
                    followerIds.remove(followerId);
                    followRepository.save(followingDTO);
                    logger.info("{} removed from followers of {}", followerId, followingId);
                }
            }
        } catch (BadRequestException | NotFoundException e) {
            logger.warn("Error in unfollowing user: {} by {}. Error: {}", followingId, followerId, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while unfollowing user: {} by {}. Error: {}", followingId, followerId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while unfollowing the user");
        }
    }

    public FollowerDTO getUserConnections(String userId) {
        try {
            return followRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error fetching connections for user: {}. Error: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An error occurred while fetching user connections");
        }
    }

    public int getUserFollowersCount(String userId) {
        try {
            FollowerDTO followerDTO = followRepository.findByUserId(userId);
            return (followerDTO != null) ? followerDTO.getFollowerId().size() : 0;
        } catch (Exception e) {
            logger.error("Error fetching followers count for user: {}. Error: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An error occurred while fetching user followers count");
        }
    }

    public int getUserFollowingCount(String userId) {
        try {
            FollowerDTO followerDTO = followRepository.findByUserId(userId);
            return (followerDTO != null) ? followerDTO.getFollowingId().size() : 0;
        } catch (Exception e) {
            logger.error("Error fetching following count for user: {}. Error: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An error occurred while fetching user following count");
        }
    }

    public boolean isUserFollowing(String userId, String targetUserId) {
        try {
            FollowerDTO followerDTO = followRepository.findByUserId(userId);
            if (followerDTO != null) {
                return followerDTO.getFollowingId().contains(targetUserId);
            }
            return false;
        } catch (Exception e) {
            throw new InternalServerErrorException("An error occurred while checking if the user is following");
        }
    }

}
