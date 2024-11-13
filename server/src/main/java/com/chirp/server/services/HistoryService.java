package com.chirp.server.services;


import com.chirp.server.models.History;
import com.chirp.server.models.QuestionAnswerPair;
import com.chirp.server.repositories.HistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

	private static final Logger logger = LoggerFactory.getLogger(HistoryService.class);

	@Autowired
	private HistoryRepository historyRepository;

	public History saveHistory(String sessionId , String userId , List<QuestionAnswerPair> questionAnswerPairs) {
		try {
			logger.info("Attempting to save history for userId: {}, sessionId: {}" , userId , sessionId);

			Optional<History> existingHistoryOptional = historyRepository.findBySessionId(sessionId);
			History history;

			if (existingHistoryOptional.isPresent()) {
				history = existingHistoryOptional.get();
				history.getQuestionAnswerPairs().addAll(questionAnswerPairs);
				logger.info("Appending to existing history for sessionId: {}" , sessionId);
			} else {
				history = new History(sessionId , userId , questionAnswerPairs);
				logger.info("Creating new history for sessionId: {}" , sessionId);
			}

			History savedHistory = historyRepository.save(history);
			logger.info("Successfully saved history for userId: {}, sessionId: {}" , userId , sessionId);
			return savedHistory;
		} catch (Exception e) {
			logger.error("Error saving history for userId: {}, sessionId: {}. Error: {}" , userId , sessionId , e.getMessage());
			throw e;
		}
	}

	public List<History> getAllHistories() {
		try {
			logger.info("Fetching all histories");
			return historyRepository.findAll();
		} catch (Exception e) {
			logger.error("Error fetching all histories. Error: {}" , e.getMessage());
			throw e;
		}
	}

	public List<History> getHistoryByUserId(String userId) {
		try {
			logger.info("Fetching history for userId: {}" , userId);
			return historyRepository.findByUserId(userId);
		} catch (Exception e) {
			logger.error("Error fetching history for userId: {}. Error: {}" , userId , e.getMessage());
			throw e;
		}
	}

	public Optional<History> getHistoryBySessionId(String sessionId) {
		try {
			logger.info("Fetching history for sessionId: {}" , sessionId);
			return historyRepository.findBySessionId(sessionId);
		} catch (Exception e) {
			logger.error("Error fetching history for sessionId: {}. Error: {}" , sessionId , e.getMessage());
			throw e;
		}
	}

	public void deleteHistoryBySessionId(String sessionId) {
		try {
			logger.info("Attempting to delete history for sessionId: {}" , sessionId);
			Optional<History> historyOptional = historyRepository.findBySessionId(sessionId);

			if (historyOptional.isPresent()) {
				historyRepository.delete(historyOptional.get());
				logger.info("Successfully deleted history for sessionId: {}" , sessionId);
			} else {
				logger.warn("No history found for sessionId: {}" , sessionId);
				throw new IllegalArgumentException("History does not exist");
			}
		} catch (Exception e) {
			logger.error("Error deleting history for sessionId: {}. Error: {}" , sessionId , e.getMessage());
			throw e;
		}
	}

	public void deleteAllHistory(String userId) {
		try {
			logger.info("Attempting to delete all history for user: {}" , userId);
			List<History> histories = historyRepository.findByUserId(userId);

			if (!histories.isEmpty()) {
				historyRepository.deleteAll(histories);
				logger.info("Successfully deleted all history for user: {}" , userId);
			} else {
				logger.warn("No history found for userId: {}" , userId);
				throw new IllegalArgumentException("No history exists for userId: " + userId);
			}
		} catch (Exception e) {
			logger.error("Error deleting history for userId: {}. Error: {}" , userId , e.getMessage());
			throw e;
		}
	}

	@Scheduled(fixedRate = 86400000)
    public void deleteOldHistory() {
        try {
            LocalDate oneDayAgo = LocalDate.now().minusDays(1);
            List<History> historiesToDelete = historyRepository.findByHistoryDateBefore(oneDayAgo);

            if (!historiesToDelete.isEmpty()) {
                historyRepository.deleteAll(historiesToDelete);
                logger.info("Successfully deleted histories older than 1 day");
            } else {
                logger.info("No histories older than 1 day found");
            }
        } catch (Exception e) {
            logger.error("Error deleting old histories. Error: {}", e.getMessage());
            throw e;
        }
    }
}
