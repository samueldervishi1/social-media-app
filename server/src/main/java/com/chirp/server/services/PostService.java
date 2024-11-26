package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
import com.chirp.server.models.ActivityModel;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.ActivityRepository;
import com.chirp.server.repositories.CommunityRepository;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
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

	@Autowired
	private CommunityRepository communityRepository;

	public void createPost(String username , Post post) {
		User user = getUserByUsername(username);
		preparePost(post , user);

		Post savedPost = postRepository.save(post);
		logger.info("Post successfully saved with ID: {}" , savedPost.getId());

		updateActivity(user.getId() , post.getId());
	}

	private void preparePost(Post post , User user) {
		post.setUserId(user.getId());
		post.setPostDate(LocalDate.now().toString());
		post.setPostTime(LocalTime.now().toString());
		logger.debug("Preparing to save post with date: {}" , post.getPostDate());
	}

	private void updateActivity(String userId , String postId) {
		String activityDescription = "created post with id " + postId;
		List<ActivityModel> existingActivities = activityRepository.findByUserId(userId);

		if (!existingActivities.isEmpty()) {
			for (ActivityModel activity : existingActivities) {
				logger.debug("Updating activity with ID: {}" , activity.getId());
				activity.getActionType().getAllActivity().add(activityDescription);
				activityRepository.save(activity);
			}
			logger.info("Updated existing activities with new description: {}" , activityDescription);
		} else {
			ActivityModel.ActionType actionType = new ActivityModel.ActionType(Collections.singletonList(activityDescription));
			ActivityModel activity = new ActivityModel(actionType , userId , Instant.now() , "active");
			activityRepository.save(activity);
			logger.info("Created new activity with description: {}" , activityDescription);
		}
	}

	public List<Post> getAllDBPosts() {
		List<Post> posts = postRepository.findAll();
		posts.forEach(post -> logger.info("Fetched post with date: {}" , post.getPostDate()));
		return posts;
	}

	public Post getPostById(String postId) {
		return postRepository.findById(postId)
				.orElseThrow(() -> new NotFoundException("Post not found with ID: " + postId));
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User not found with username: " + username));
	}

	public List<Post> getUserPosts(String userId) {
		return postRepository.findByUserId(userId);
	}

	public int getPostCountPerUser(String userId) {
		return postRepository.countByUserId(userId);
	}

	@Transactional
	public void deletePost(String postId) {
		Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
		post.setDeleted(true);
		postRepository.save(post);
	}
}