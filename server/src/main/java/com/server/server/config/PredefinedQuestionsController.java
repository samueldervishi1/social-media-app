package com.server.server.config;

import com.server.server.models.PredefineQuestions;
import com.server.server.services.PredefinedQuestionsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PredefinedQuestionsController {

	private final PredefinedQuestionsService predefinedQuestionsService;

	public PredefinedQuestionsController(PredefinedQuestionsService predefinedQuestionsService) {
		this.predefinedQuestionsService = predefinedQuestionsService;
	}

	@GetMapping("/get/predefined")
	public List<PredefineQuestions> getAllQuestions() {
		return predefinedQuestionsService.getAllQuestions();
	}
}