package com.server.server.services;

import com.server.server.models.History;
import com.server.server.models.QuestionAnswerPair;
import com.server.server.repositories.HistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class HistoryService {

	private static final String NO_HISTORY_ERROR = "No history exists for userId: ";

	private final HistoryRepository historyRepository;

	public HistoryService(HistoryRepository historyRepository) {
		this.historyRepository = historyRepository;
	}

	public History saveHistory(String sessionId , String userId , List<QuestionAnswerPair> questionAnswerPairs) {
		History history = historyRepository.findBySessionId(sessionId)
				.map(existing -> {
					existing.getQuestionAnswerPairs().addAll(questionAnswerPairs);
					return existing;
				})
				.orElseGet(() -> new History(sessionId , userId , questionAnswerPairs));

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
				.orElseThrow(() -> {
					return new IllegalArgumentException("History does not exist");
				});

		historyRepository.delete(history);
	}

	public void deleteAllHistory(String userId) {
		List<History> histories = historyRepository.findByUserId(userId);
		if (histories.isEmpty()) {
			throw new IllegalArgumentException(NO_HISTORY_ERROR + userId);
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