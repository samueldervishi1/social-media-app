package com.chattr.server.repositories;

import com.chattr.server.models.History;
import com.mongodb.lang.NonNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HistoryRepository extends MongoRepository<History, String> {

    List<History> findByUserId(String userId);

    @NonNull
    List<History> findAll();

    Optional<History> findBySessionId(String sessionId);

    List<History> findByHistoryDateBefore(LocalDate historyDate);
}
