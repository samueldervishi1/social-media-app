package com.chattr.server.repositories;

import com.chattr.server.models.History;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for managing user interaction and conversation history.
 */
public interface HistoryRepository extends MongoRepository<History, String> {

	/**
	 * Finds all histories for a given user.
	 *
	 * @param userId the user ID
	 * @return list of user histories
	 */
	List<History> findByUserId(String userId);

	/**
	 * Retrieves all history documents.
	 *
	 * @return list of all histories
	 */
	List<History> findAll();

	/**
	 * Finds a specific history record by session ID.
	 *
	 * @param sessionId session identifier
	 * @return optional containing matching history
	 */
	Optional<History> findBySessionId(String sessionId);

	/**
	 * Finds all histories created before the given date.
	 * Useful for cleanup and archival.
	 *
	 * @param historyDate cutoff date
	 * @return list of old history records
	 */
	List<History> findByHistoryDateBefore(LocalDate historyDate);
}