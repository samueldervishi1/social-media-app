package com.chirp.server.services;

import com.chirp.server.models.History;
import com.chirp.server.models.QuestionAnswerPair;
import com.chirp.server.repositories.HistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

	private static final Logger logger = LoggerFactory.getLogger(HistoryService.class);
	private static final String NO_HISTORY_ERROR = "No history exists for userId: ";

	private final HistoryRepository historyRepository;

	public HistoryService(HistoryRepository historyRepository) {
		this.historyRepository = historyRepository;
	}

	public History saveHistory(String sessionId , String userId , List<QuestionAnswerPair> questionAnswerPairs) {
		logger.info("Attempting to save history for userId: {}, sessionId: {}" , userId , sessionId);

		History history = historyRepository.findBySessionId(sessionId)
				.map(existing -> {
					existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
					logger.info("Appending to existing history for sessionId: {}" , sessionId);
					return existing;
				})
				.orElseGet(() -> {
					logger.info("Creating new history for sessionId: {}" , sessionId);
					return new History(sessionId , userId , questionAnswerPairs);
				});

		History savedHistory = historyRepository.save(history);
		logger.info("Successfully saved history for userId: {}, sessionId: {}" , userId , sessionId);
		return savedHistory;
	}

	public List<History> getAllHistories() {
		logger.info("Fetching all histories");
		return historyRepository.findAll();
	}

	public List<History> getHistoryByUserId(String userId) {
		logger.info("Fetching history for userId: {}" , userId);
		return historyRepository.findByUserId(userId);
	}

	public Optional<History> getHistoryBySessionId(String sessionId) {
		logger.info("Fetching history for sessionId: {}" , sessionId);
		return historyRepository.findBySessionId(sessionId);
	}

	public void deleteHistoryBySessionId(String sessionId) {
		logger.info("Attempting to delete history for sessionId: {}" , sessionId);

		History history = historyRepository.findBySessionId(sessionId)
				.orElseThrow(() -> {
					logger.warn("No history found for sessionId: {}" , sessionId);
					return new IllegalArgumentException("History does not exist");
				});

		historyRepository.delete(history);
		logger.info("Successfully deleted history for sessionId: {}" , sessionId);
	}

	public void deleteAllHistory(String userId) {
		logger.info("Attempting to delete all history for user: {}" , userId);
		List<History> histories = historyRepository.findByUserId(userId);

		if (histories.isEmpty()) {
			logger.warn("No history found for userId: {}" , userId);
			throw new IllegalArgumentException(NO_HISTORY_ERROR + userId);
		}

		historyRepository.deleteAll(histories);
		logger.info("Successfully deleted all history for user: {}" , userId);
	}

	@Scheduled(fixedRate = 86400000) // 24 hours
	public void deleteOldHistory() {
		LocalDate oneDayAgo = LocalDate.now().minusDays(1);
		List<History> historiesToDelete = historyRepository.findByHistoryDateBefore(oneDayAgo);

		if (!historiesToDelete.isEmpty()) {
			historyRepository.deleteAll(historiesToDelete);
			logger.info("Successfully deleted {} histories older than 1 day" , historiesToDelete.size());
		} else {
			logger.info("No histories older than 1 day found");
		}
	}
}