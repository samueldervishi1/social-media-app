package com.chattr.server.services;

import com.chattr.server.models.Messages;
import com.chattr.server.models.History;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.repositories.HistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(HistoryService.class);

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public History saveHistory(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
        History history = historyRepository.findBySessionId(sessionId)
                .map(existing -> {
                    existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
                    LOGGER.info("Appending new entries to existing session '{}'", sessionId);
                    return existing;
                })
                .orElseGet(() -> {
                    LOGGER.info("Creating new history entry for session '{}'", sessionId);
                    return new History(sessionId, userId, questionAnswerPairs);
                });

        History saved = historyRepository.save(history);
        LOGGER.info("History saved for session '{}'", sessionId);
        return saved;
    }

    public List<History> getAllHistories() {
        List<History> all = historyRepository.findAll();
        LOGGER.info("Fetched {} total history records", all.size());
        return all;
    }

    public List<History> getHistoryByUserId(String userId) {
        List<History> histories = historyRepository.findByUserId(userId);
        LOGGER.info("Fetched {} history records for userId '{}'", histories.size(), userId);
        return histories;
    }

    public Optional<History> getHistoryBySessionId(String sessionId) {
        Optional<History> history = historyRepository.findBySessionId(sessionId);
        LOGGER.info("History lookup by sessionId '{}': {}", sessionId, history.isPresent() ? "FOUND" : "NOT FOUND");
        return history;
    }

    public void deleteHistoryBySessionId(String sessionId) {
        History history = historyRepository.findBySessionId(sessionId)
                .orElseThrow(() -> {
                    LOGGER.warn("Attempted to delete non-existing session '{}'", sessionId);
                    return new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR, sessionId));
                });

        historyRepository.delete(history);
        LOGGER.info("Deleted history for session '{}'", sessionId);
    }

    public void deleteAllHistory(String userId) {
        List<History> histories = historyRepository.findByUserId(userId);
        if (histories.isEmpty()) {
            LOGGER.warn("No history found for userId '{}', nothing to delete", userId);
            throw new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR, userId));
        }
        historyRepository.deleteAll(histories);
        LOGGER.info("Deleted {} history records for userId '{}'", histories.size(), userId);
    }

    @Scheduled(fixedRate = 86_400_000) // 24 hours in milliseconds
    public void deleteOldHistory() {
        LocalDate cutoffDate = LocalDate.now().minusDays(1);
        List<History> outdated = historyRepository.findByHistoryDateBefore(cutoffDate);

        if (!outdated.isEmpty()) {
            historyRepository.deleteAll(outdated);
            LOGGER.info("Scheduled cleanup: Deleted {} outdated history records (before {})", outdated.size(), cutoffDate);
        } else {
            LOGGER.info("Scheduled cleanup: No outdated history records found (before {})", cutoffDate);
        }
    }
}