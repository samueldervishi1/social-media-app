package com.chirp.server.repositories;

import com.chirp.server.models.History;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends MongoRepository<History, String> {

	List<History> findByUserId(String id);

	List<History> findAll();

	Optional<History> findBySessionId(String sessionId);

	List<History> findByHistoryDateBefore(LocalDate historyDate);
}
