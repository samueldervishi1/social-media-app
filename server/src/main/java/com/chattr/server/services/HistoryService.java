package com.chattr.server.services;

import com.chattr.server.models.Codes;
import com.chattr.server.models.History;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.repositories.HistoryRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public History saveHistory(String sessionId, String userId, List<QuestionAnswerPair> questionAnswerPairs) {
        History history = historyRepository.findBySessionId(sessionId)
                .map(existing -> {
                    existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
                    return existing;
                })
                .orElseGet(() -> new History(sessionId, userId, questionAnswerPairs));

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
                .orElseThrow(() -> new IllegalArgumentException(String.format(Codes.NO_HISTORY_ERROR, sessionId)));

        historyRepository.delete(history);
    }

    public void deleteAllHistory(String userId) {
        List<History> histories = historyRepository.findByUserId(userId);
        if (histories.isEmpty()) {
            throw new IllegalArgumentException(String.format(Codes.NO_HISTORY_ERROR, userId));
        }
        historyRepository.deleteAll(histories);
    }

    @Scheduled(fixedRate = 86400000) // 24 hours
    public void deleteOldHistory() {
        LocalDate oneDayAgo = LocalDate.now().minusDays(1);
        List<History> historiesToDelete = historyRepository.findByHistoryDateBefore(oneDayAgo);

        if (!historiesToDelete.isEmpty()) {
            historyRepository.deleteAll(historiesToDelete);
        }
    }
}