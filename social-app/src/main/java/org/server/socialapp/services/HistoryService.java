package org.server.socialapp.services;

import org.server.socialapp.models.History;
import org.server.socialapp.models.QuestionAnswerPair;
import org.server.socialapp.repositories.HistoryRepository;
import org.server.socialapp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

    private static final Logger logger = LoggerFactory.getLogger(HistoryService.class);

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    public History saveHistory(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
        try {
            logger.info("Attempting to save history for userId: {}, sessionId: {}", userId, sessionId);

            if (!userRepository.existsById(userId)) {
                logger.error("User with ID: {} does not exist", userId);
                throw new IllegalArgumentException("User does not exist");
            }
            Optional<History> existingHistoryOptional = historyRepository.findByUserId(userId);
            History history;

            if (existingHistoryOptional.isPresent()) {
                history = existingHistoryOptional.get();
                history.getQuestionAnswerPairs().addAll(questionAnswerPairs);
                logger.info("Appending to existing history for userId: {}", userId);
            } else {
                history = new History(sessionId, userId, questionAnswerPairs);
                logger.info("Creating new history for userId: {}", userId);
            }

            History savedHistory = historyRepository.save(history);
            logger.info("Successfully saved history for userId: {}, sessionId: {}", userId, sessionId);
            return savedHistory;
        } catch (Exception e) {
            logger.error("Error saving history for userId: {}, sessionId: {}. Error: {}", userId, sessionId, e.getMessage());
            throw e;
        }
    }

    public List<History> getAllHistories() {
        try {
            logger.info("Fetching all histories");
            return historyRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching all histories. Error: {}", e.getMessage());
            throw e;
        }
    }

    public Optional<History> getHistoryByUserId(String userId) {
        try {
            logger.info("Fetching history for userId: {}", userId);
            return historyRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error fetching history for userId: {}. Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    public Optional<History> getHistoryBySessionId(String sessionId) {
        try {
            logger.info("Fetching history for sessionId: {}", sessionId);
            return historyRepository.findBySessionId(sessionId);
        } catch (Exception e) {
            logger.error("Error fetching history for sessionId: {}. Error: {}", sessionId, e.getMessage());
            throw e;
        }
    }

    public void deleteHistoryBySessionId(String sessionId) {
        try {
            logger.info("Attempting to delete history for sessionId: {}", sessionId);
            Optional<History> historyOptional = historyRepository.findBySessionId(sessionId);

            if (historyOptional.isPresent()) {
                historyRepository.delete(historyOptional.get());
                logger.info("Successfully deleted history for sessionId: {}", sessionId);
            } else {
                logger.warn("No history found for sessionId: {}", sessionId);
                throw new IllegalArgumentException("History does not exist");
            }
        } catch (Exception e) {
            logger.error("Error deleting history for sessionId: {}. Error: {}", sessionId, e.getMessage());
            throw e;
        }
    }
}
