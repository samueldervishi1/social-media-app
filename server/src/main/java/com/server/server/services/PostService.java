package com.server.server.services;

import com.server.server.exceptions.CustomException;
import com.server.server.models.Post;
import com.server.server.models.User;
import com.server.server.repositories.PostRepository;
import com.server.server.repositories.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class PostService {

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
		User user = getUserByUsername(username);
		preparePost(post , user);
		postRepository.save(post);
	}

	private void preparePost(Post post , User user) {
		post.setUserId(user.getId());
		post.setPostDate(LocalDate.now().toString());
		post.setPostTime(LocalTime.now().toString());
	}

	@Cacheable(value = "allPosts")
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

	@Cacheable(value = "userPosts", key = "#userId")
	public List<Post> getUserPosts(String userId) {
		return postRepository.findByUserId(userId);
	}

	@Cacheable(value = "postCount", key = "#userId")
	public long getPostCountPerUser(String userId) {
		return postRepository.countByUserIdAndDeletedFalse(userId);
	}

	@Transactional
	public void deletePost(String postId) {
		Post post = getPostById(postId);
		post.setDeleted(true);
		postRepository.save(post);
	}
}