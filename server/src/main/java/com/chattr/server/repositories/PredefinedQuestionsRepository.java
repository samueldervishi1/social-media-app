package com.chattr.server.repositories;

import com.chattr.server.models.PredefineQuestions;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredefinedQuestionsRepository extends MongoRepository<PredefineQuestions, String> {
}
