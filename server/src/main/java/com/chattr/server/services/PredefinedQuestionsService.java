package com.chattr.server.services;

import com.chattr.server.models.PredefineQuestions;
import com.chattr.server.repositories.PredefinedQuestionsRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service responsible for retrieving predefined questions used in the system.
 */
@Service
public class PredefinedQuestionsService {

    private final PredefinedQuestionsRepository predefinedQuestionsRepository;

    public PredefinedQuestionsService(PredefinedQuestionsRepository predefinedQuestionsRepository) {
        this.predefinedQuestionsRepository = predefinedQuestionsRepository;
    }

    public List<PredefineQuestions> getAllQuestions() {
        return predefinedQuestionsRepository.findAll();
    }
}
