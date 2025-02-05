package com.chirp.server.services;

import com.chirp.server.exceptions.CustomException;
import com.chirp.server.models.Post;
import com.chirp.server.models.User;
import com.chirp.server.repositories.PostRepository;
import com.chirp.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class PostService {

	private static final Logger logger = LoggerFactory.getLogger(PostService.class);
	private static final String POST_NOT_FOUND = "Post not found with ID: ";
	private static final String USER_NOT_FOUND = "User not found with username: ";

	private final UserRepository userRepository;
	private final PostRepository postRepository;

	public PostService(UserRepository userRepository , PostRepository postRepository) {
		this.userRepository = userRepository;
		this.postRepository = postRepository;
	}

	@Transactional
	public void createPost(String username , Post post) {
		logger.info("Starting post creation for username: {}" , username);

		try {
			User user = getUserByUsername(username);
			logger.debug("User retrieved: {}" , user);

			preparePost(post , user);

			Post savedPost = postRepository.save(post);
			logger.info("Post successfully saved with ID: {}" , savedPost.getId());
		} catch (Exception e) {
			logger.error("Error occurred while creating post for username: {}" , username , e);
			throw e;
		}
	}

	private void preparePost(Post post , User user) {
		logger.info("Preparing post for user ID: {}" , user.getId());
		post.setUserId(user.getId());
		post.setPostDate(LocalDate.now().toString());
		post.setPostTime(LocalTime.now().toString());
		logger.info("Post prepared with date: {}, time: {}" , post.getPostDate() , post.getPostTime());
	}

	public List<Post> getAllPosts() {
		return postRepository.findAll();
	}

	public Post getPostById(String postId) {
		return postRepository.findById(postId)
				.orElseThrow(() -> new CustomException(POST_NOT_FOUND + postId));
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new CustomException(USER_NOT_FOUND + username));
	}

	public List<Post> getUserPosts(String userId) {
		return postRepository.findByUserId(userId);
	}

	public long getPostCountPerUser(String userId) {
		return postRepository.countByUserIdAndDeletedFalse(userId);
	}

	@Transactional
	public void deletePost(String postId) {
		Post post = getPostById(postId);
		post.setDeleted(true);
		postRepository.save(post);
		logger.info("Post with ID {} marked as deleted" , postId);
	}
}