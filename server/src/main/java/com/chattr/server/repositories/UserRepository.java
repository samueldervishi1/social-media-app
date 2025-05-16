package com.chattr.server.repositories;

import com.chattr.server.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repository for managing user data and performing user-related operations.
 */
public interface UserRepository extends MongoRepository<User, String> {

	/**
	 * Checks if a username already exists in the database.
	 *
	 * @param username the username to check
	 * @return true if the username exists, false otherwise
	 */
	boolean existsByUsername(String username);

	/**
	 * Checks if an email already exists in the database.
	 *
	 * @param email the email to check
	 * @return true if the email exists, false otherwise
	 */
	boolean existsByEmail(String email);

	/**
	 * Finds a user by their username.
	 *
	 * @param username the username to search for
	 * @return an optional containing the user if found, or empty if not
	 */
	Optional<User> findByUsername(String username);
}