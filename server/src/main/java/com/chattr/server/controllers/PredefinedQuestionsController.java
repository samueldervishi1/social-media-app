package com.chattr.server.controllers;

import com.chattr.server.models.PredefineQuestions;
import com.chattr.server.services.PredefinedQuestionsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for handling predefined chatbot questions.
 */
@RestController
@RequestMapping("/questions")
public class PredefinedQuestionsController {

    private final PredefinedQuestionsService predefinedQuestionsService;

    public PredefinedQuestionsController(PredefinedQuestionsService predefinedQuestionsService) {
        this.predefinedQuestionsService = predefinedQuestionsService;
    }

    @GetMapping
    public List<PredefineQuestions> getAllQuestions() {
        return predefinedQuestionsService.getAllQuestions();
    }
}