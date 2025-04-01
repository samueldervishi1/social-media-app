package com.server.server.services;

import com.server.server.models.PredefineQuestions;
import com.server.server.repositories.PredefinedQuestionsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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