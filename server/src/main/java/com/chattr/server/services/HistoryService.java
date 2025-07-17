package com.chattr.server.services;

import com.chattr.server.models.History;
import com.chattr.server.models.Messages;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.repositories.HistoryRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service to manage conversation histories by session and user ID. Supports
 * saving, fetching, deleting, and auto-cleanup of old history.
 */
@Service
public class HistoryService {

    private final HistoryRepository historyRepository;
    private static final Logger LOGGER = LoggerFactory.getLogger(HistoryService.class);

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public History saveHistory(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
        History history = historyRepository.findBySessionId(sessionId).map(existing -> {
            existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
            return existing;
        }).orElseGet(() -> new History(sessionId, userId, questionAnswerPairs));

        return historyRepository.save(history);
    }

    public List<History> getAllHistories() {
        return historyRepository.findAll();
    }

    public List<History> getHistoryByUserId(String userId) {
        return historyRepository.findByUserId(userId);
    }

    public Optional<History> getHistoryBySessionId(String sessionId) {
        return historyRepository.findBySessionId(sessionId);
    }

    public void deleteHistoryBySessionId(String sessionId) {
        History history = historyRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR, sessionId)));

        historyRepository.delete(history);
    }

    public void deleteAllHistory(String userId) {
        List<History> histories = historyRepository.findByUserId(userId);
        if (histories.isEmpty()) {
            throw new IllegalArgumentException(String.format(Messages.NO_HISTORY_ERROR, userId));
        }
        historyRepository.deleteAll(histories);
    }

    @Scheduled(fixedRate = 86_400_000) // 24 hours in milliseconds
    public void deleteOldHistory() {
        LocalDate cutoffDate = LocalDate.now().minusDays(1);
        List<History> outdated = historyRepository.findByHistoryDateBefore(cutoffDate);

        if (!outdated.isEmpty()) {
            historyRepository.deleteAll(outdated);
            LOGGER.info("Scheduled cleanup: Deleted {} outdated history records (before {})", outdated.size(),
                    cutoffDate);
        } else {
            LOGGER.info("Scheduled cleanup: No outdated history records found (before {})", cutoffDate);
        }
    }
}
