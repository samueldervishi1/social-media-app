package com.server.server.repositories;

import com.server.server.models.PredefineQuestions;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredefinedQuestionsRepository extends MongoRepository<PredefineQuestions, String> {
}