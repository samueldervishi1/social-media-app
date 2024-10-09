package org.server.socialapp.services;

import org.server.socialapp.exceptions.BadRequestException;
import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.models.SavePost;
import org.server.socialapp.repositories.ActivityRepository;
import org.server.socialapp.repositories.SavePostRepository;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class SavePostService {
    private static final Logger logger = LoggerFactory.getLogger(SavePostService.class);

    @Autowired
    private SavePostRepository savePostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public SavePost savePosts(String userId, List<String> postIds) {
        try {
            if (!userRepository.existsById(userId)) {
                logger.error("User {} does not exist", userId);
                throw new NotFoundException("User " + userId + " does not exist");
            }

            Optional<SavePost> existingSavePostOptional = savePostRepository.findByUserId(userId);

            SavePost savePost;
            if (existingSavePostOptional.isPresent()) {
                savePost = existingSavePostOptional.get();
                List<String> newPostIds = postIds.stream()
                        .filter(postId -> !savePost.getPostIds().contains(postId))
                        .toList();
                if (newPostIds.isEmpty()) {
                    logger.warn("User {} is trying to save posts that are already saved", userId);
                    throw new BadRequestException("User " + userId + " is trying to save posts that are already saved");
                }
                savePost.getPostIds().addAll(newPostIds);
            } else {
                savePost = new SavePost(userId, postIds);
            }

            String activityDescription = userId + "saved post with id " + postIds;
            List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

            if (!existingActivities.isEmpty()) {
                for (ActivityModel activity : existingActivities) {
                    activity.getActionType().getAllActivity().add(activityDescription);
                    activityRepository.save(activity);
                }
            } else {
                ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                ActivityModel activity = new ActivityModel(actionType, userId, Instant.now(), "active");
                activityRepository.save(activity);
            }

            return savePostRepository.save(savePost);
        } catch (BadRequestException | NotFoundException e) {
            logger.error("Error saving posts for user {}: {}", userId, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while saving posts for user {}: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while saving posts");
        }
    }

    public SavePost unsavePost(String userId, String postId) {
        try {
            Optional<SavePost> existingSavePostOptional = savePostRepository.findByUserId(userId);

            if (existingSavePostOptional.isPresent()) {
                SavePost savePost = existingSavePostOptional.get();
                if (savePost.getPostIds().remove(postId)) {
                    return savePostRepository.save(savePost);
                } else {
                    logger.warn("Post {} not found in saved posts for user {}", postId, userId);
                    throw new NotFoundException("Post " + postId + " not found in saved posts for user " + userId);
                }
            } else {
                logger.warn("No saved posts found for user {}", userId);
                throw new NotFoundException("No saved posts found for user " + userId);
            }
        } catch (NotFoundException e) {
            logger.error("Error unsaving post for user {}: {}", userId, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while unsaving post for user {}: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while unsaving the post");
        }
    }

    public SavePost getSavedPostsForUser(String userId) {
        try {
            Optional<SavePost> savedPostsOptional = savePostRepository.findByUserId(userId);
            return savedPostsOptional.orElse(null);
        } catch (Exception e) {
            logger.error("Error fetching saved posts for user {}: {}", userId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while fetching saved posts");
        }
    }

    public int getNumberOfSavedPosts(String postId) {
        try {
            List<SavePost> savePosts = savePostRepository.findByPostIdsContaining(postId);
            return savePosts.size(); // Return the count of saved posts
        } catch (Exception e) {
            logger.error("Error fetching saved count for post ID {}: {}", postId, e.getMessage(), e);
            throw new InternalServerErrorException("An unexpected error occurred while fetching saved count for the post");
        }
    }
}
