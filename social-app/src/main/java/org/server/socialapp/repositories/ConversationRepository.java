package org.server.socialapp.repositories;

import org.server.socialapp.models.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Conversation findByParticipants(List<String> participants);
}