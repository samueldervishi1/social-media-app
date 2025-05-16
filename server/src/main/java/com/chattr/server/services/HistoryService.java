package com.chattr.server.services;

import com.chattr.server.models.Messages;
import com.chattr.server.models.History;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.repositories.HistoryRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service to manage conversation histories by session and user ID.
 * Supports saving, fetching, deleting, and auto-cleanup of old history.
 */
@Service
public class HistoryService {

	private final HistoryRepository historyRepository;

	public HistoryService(HistoryRepository historyRepository) {
		this.historyRepository = historyRepository;
	}

	/**
	 * Appends new Q&A pairs to existing history or creates a new history entry.
	 */
	public History saveHistory(String sessionId , String userId , List<QuestionAnswerPair> questionAnswerPairs) {
		History history = historyRepository.findBySessionId(sessionId)
				.map(existing -> {
					existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
					return existing;
				})
				.orElseGet(() -> new History(sessionId , userId , questionAnswerPairs));

		return historyRepository.save(history);
	}

	/**
	 * Retrieves all history entries in the database.
	 */
	public List<History> getAllHistories() {
		return historyRepository.findAll();
	}

	/**
	 * Retrieves history entries by a specific user.
	 */
	public List<History> getHistoryByUserId(String userId) {
		return historyRepository.findByUserId(userId);
	}

	/**
	 * Retrieves a history entry by session ID.
	 */
	public Optional<History> getHistoryBySessionId(String sessionId) {
		return historyRepository.findBySessionId(sessionId);
	}

	/**
	 * Deletes a specific history record by session ID.
	 */
	public void deleteHistoryBySessionId(String sessionId) {
		History history = historyRepository.findBySessionId(sessionId)
				.orElseThrow(() -> new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR , sessionId)));

		historyRepository.delete(history);
	}

	/**
	 * Deletes all history records for a given user.
	 */
	public void deleteAllHistory(String userId) {
		List<History> histories = historyRepository.findByUserId(userId);
		if (histories.isEmpty()) {
			throw new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR , userId));
		}
		historyRepository.deleteAll(histories);
	}

	/**
	 * Scheduled job that deletes histories older than 1 day.
	 * Runs every 24 hours.
	 */
	@Scheduled(fixedRate = 86_400_000) // 24 hours in milliseconds
	public void deleteOldHistory() {
		LocalDate cutoffDate = LocalDate.now().minusDays(1);
		List<History> outdated = historyRepository.findByHistoryDateBefore(cutoffDate);

		if (!outdated.isEmpty()) {
			historyRepository.deleteAll(outdated);
		}
	}
}