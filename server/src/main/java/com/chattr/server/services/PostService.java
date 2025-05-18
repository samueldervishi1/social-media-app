package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Messages;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Service responsible for managing user posts, including creation,
 * retrieval, and soft deletion.
 */
@Service
public class PostService {

	private final UserRepository userRepository;
	private final PostRepository postRepository;
	private static final Logger LOGGER = LoggerFactory.getLogger(PostService.class);

	public PostService(UserRepository userRepository , PostRepository postRepository) {
		this.userRepository = userRepository;
		this.postRepository = postRepository;
	}

	/**
	 * Creates a new post associated with the given username.
	 *
	 * @param username the username of the poster
	 * @param post     the post object to persist
	 */
	@Transactional
	public void createPost(String username , Post post) {
		User user = getUserByUsername(username);
		enrichPostWithMetadata(post , user);
		postRepository.save(post);
		LOGGER.info("Post created by user '{}' with postId '{}'" , username , post.getId());
	}

	/**
	 * Enriches a post with user ID, date, and time.
	 */
	private void enrichPostWithMetadata(Post post , User user) {
		post.setUserId(user.getId());
		post.setPostDate(LocalDate.now().toString());
		post.setPostTime(LocalTime.now().toString());
	}

	/**
	 * Returns all posts in the system.
	 */
	public List<Post> getAllPosts() {
		List<Post> posts = postRepository.findAll();
		LOGGER.info("Fetched {} posts from database" , posts.size());
		return posts;
	}

	/**
	 * Retrieves a post by its ID or throws a 404-style exception.
	 */
	public Post getPostById(String postId) {
		return postRepository.findById(postId)
				.orElseThrow(() -> {
					LOGGER.warn("Post not found with ID: {}" , postId);
					return new CustomException(String.format(Messages.POST_NOT_FOUND , postId));
				});
	}

	/**
	 * Retrieves all posts authored by a specific user.
	 */
	public List<Post> getUserPosts(String userId) {
		List<Post> posts = postRepository.findByUserId(userId);
		LOGGER.info("Fetched {} posts for userId '{}'" , posts.size() , userId);
		return posts;
	}

	/**
	 * Returns the number of active (non-deleted) posts for a user.
	 */
	public long getPostCountPerUser(String userId) {
		long count = postRepository.countByUserIdAndDeletedFalse(userId);
		LOGGER.info("Post count for userId '{}': {}" , userId , count);
		return count;
	}

	/**
	 * Soft deletes a post by marking it as deleted.
	 */
	@Transactional
	public void deletePost(String postId) {
		Post post = getPostById(postId);
		post.setDeleted(true);
		postRepository.save(post);
		LOGGER.info("Soft-deleted post with ID '{}'" , postId);
	}

	/**
	 * Fetches a user by username or throws if not found.
	 */
	private User getUserByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> {
					LOGGER.warn("User not found with username: {}" , username);
					return new CustomException(String.format(Messages.USER_NOT_FOUND , username));
				});
	}
}