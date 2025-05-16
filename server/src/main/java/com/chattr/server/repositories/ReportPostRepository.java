package com.chattr.server.repositories;

import com.chattr.server.models.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repository for storing reports filed by users on posts.
 */
public interface ReportPostRepository extends MongoRepository<Report, String> {

	/**
	 * Checks if a specific user has already reported a post.
	 *
	 * @param userId the ID of the reporting user
	 * @param postId the ID of the reported post
	 * @return true if the report exists, false otherwise
	 */
	boolean existsByUserIdAndPostId(String userId , String postId);
}