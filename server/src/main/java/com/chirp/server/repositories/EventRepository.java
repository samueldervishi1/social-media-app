package com.chirp.server.repositories;

import com.chirp.server.models.Event;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventRepository extends MongoRepository<Event, String> {
}