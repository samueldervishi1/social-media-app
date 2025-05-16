package com.chattr.server.repositories;

import com.chattr.server.models.PredefineQuestions;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repository for storing and retrieving predefined questions shown to users.
 */
public interface PredefinedQuestionsRepository extends MongoRepository<PredefineQuestions, String> {
}