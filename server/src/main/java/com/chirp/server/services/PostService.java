package com.chirp.server.services;

import com.chirp.server.exceptions.NotFoundException;
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

	private final UserRepository userRepository;
	private final PostRepository postRepository;
//	private final ImageService imageService;

	public PostService(UserRepository userRepository , PostRepository postRepository) {
		this.userRepository = userRepository;
		this.postRepository = postRepository;
	}

	@Transactional
	public void createPost(String username , Post post) {
		User user = getUserByUsername(username);
		preparePost(post , user);

//		if (base64Image != null && !base64Image.isEmpty()) {
//            String imageUrl = imageService.uploadImage(base64Image);
//            post.setImageUrl(imageUrl);
//        }


		Post savedPost = postRepository.save(post);
		logger.info("Post successfully saved with ID: {}" , savedPost.getId());
	}

	private void preparePost(Post post , User user) {
		post.setUserId(user.getId());
		post.setPostDate(LocalDate.now().toString());
		post.setPostTime(LocalTime.now().toString());
		logger.debug("Preparing to save post with date: {}" , post.getPostDate());
	}

	public List<Post> getAllPosts() {
		List<Post> posts = postRepository.findAll();
		posts.forEach(post -> logger.info("Fetched post with date and time: {}" , post.getPostDate()));
		return posts;
	}

	public Post getPostById(String postId) {
		return postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found with ID: " + postId));
	}

	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found with username: " + username));
	}

	public List<Post> getUserPosts(String userId) {
		return postRepository.findByUserId(userId);
	}

	public long getPostCountPerUser(String userId) {
		return postRepository.countByUserIdAndDeletedFalse(userId);
	}

	@Transactional
	public void deletePost(String postId) {
		Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found with ID: " + postId));
		post.setDeleted(true);
		postRepository.save(post);
	}
}