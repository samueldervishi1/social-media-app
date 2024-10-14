package org.server.socialapp.repositories;

import org.server.socialapp.models.History;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends MongoRepository<History, String> {
    Optional<History> findByUserId(String id);

    List<History> findAll();

    Optional<History> findBySessionId(String sessionId);

    Optional<History> findByUserIdAndHistoryDate(String userId, LocalDate historyDate);
}