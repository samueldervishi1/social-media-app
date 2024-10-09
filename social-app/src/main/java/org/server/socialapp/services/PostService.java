package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.exceptions.NotFoundException;
import org.server.socialapp.models.ActivityModel;
import org.server.socialapp.models.Post;
import org.server.socialapp.models.User;
import org.server.socialapp.repositories.ActivityRepository;
import org.server.socialapp.repositories.PostRepository;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private ActivityRepository activityRepository;

    public Post createPost(String username, Post post) {
        try {
            logger.debug("Attempting to find user with username: {}", username);
            User user = userRepository.findByUsername(username);
            if (user == null) {
                String errorMsg = "User not found with username: " + username;
                logger.warn(errorMsg);
                throw new NotFoundException(errorMsg);
            }
            post.setUserId(user.getId());
            post.setPostDate(LocalDate.now().toString());
            logger.debug("User found with ID: {}", user.getId());
            logger.info("Preparing to save post with date: {}", post.getPostDate());

            Post savedPost = postRepository.save(post);
            logger.info("Post successfully saved with ID: {}", savedPost.getId());

            String activityDescription = "created post with id " + post.getId();
            List<ActivityModel> existingActivities = activityRepository.findByUserId(user.getId());

            if (!existingActivities.isEmpty()) {
                for (ActivityModel activity : existingActivities) {
                    logger.debug("Updating activity with ID: {}", activity.getId());

                    activity.getActionType().getAllActivity().add(activityDescription);
                    activityRepository.save(activity);
                }
                logger.info("Updated existing activities with new description: {}", activityDescription);
            } else {
                ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
                ActivityModel activity = new ActivityModel(actionType, user.getId(), Instant.now(), "active");
                activityRepository.save(activity);
                logger.info("Created new activity with description: {}", activityDescription);
            }

            return savedPost;

        } catch (NotFoundException e) {
            logger.error("Error creating post: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while creating post: {}", e.getMessage(), e);
            throw new InternalServerErrorException("Error creating post");
        }
    }


    public List<Post> getUserPosts(String userId) {
        try {
            return postRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error fetching posts for user ID {}: {}", userId, e.getMessage());
            throw new InternalServerErrorException("Error fetching user posts");
        }
    }

    public int getPostCountPerUser(String userId) {
        try {
            return postRepository.countByUserId(userId);
        } catch (Exception e) {
            logger.error("Error fetching posts for user ID {}: {}", userId, e.getMessage());
            throw new InternalServerErrorException("Error fetching user posts");
        }
    }

    public List<Post> getAllDBPosts() {
        try {
            List<Post> posts = postRepository.findAll();
            posts.forEach(post -> logger.info("Fetched post with date: {}", post.getPostDate()));
            return posts;
        } catch (Exception e) {
            logger.error("Error fetching all posts: {}", e.getMessage());
            throw new InternalServerErrorException("Error fetching all posts");
        }
    }

    public Post getPostById(String postId) {
        try {
            return postRepository.findById(postId)
                    .orElseThrow(() -> new NotFoundException("Post not found with ID: " + postId));
        } catch (NotFoundException e) {
            logger.error("Error fetching post with ID {}: {}", postId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while fetching post with ID {}: {}", postId, e.getMessage());
            throw new InternalServerErrorException("Error fetching post");
        }
    }

    public void deletePost(String postId) {
        try {
            if (!postRepository.existsById(postId)) {
                throw new NotFoundException("Post not found with ID: " + postId);
            }

            postRepository.deleteById(postId);
            logger.info("Post with ID {} successfully deleted", postId);
        } catch (NotFoundException e) {
            logger.error("Error deleting post with ID {}: {}", postId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while deleting post with ID {}: {}", postId, e.getMessage());
            throw new InternalServerErrorException("Error deleting post");
        }
    }
}
