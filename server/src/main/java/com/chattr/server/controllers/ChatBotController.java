package com.chattr.server.controllers;

import com.chattr.server.services.ChatBotService;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller that handles chatbot interactions.
 */
@RestController
@RequestMapping("/chatbot")
public class ChatBotController {

    private final ChatBotService chatBotService;

    public ChatBotController(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
    }

    @PostMapping("/query")
    public Map<String, Object> askQuestion(@RequestBody Map<String, String> requestBody) {
        String question = requestBody.getOrDefault("message", "").trim();

        if (question.isEmpty()) {
            return Map.of("error", "Message cannot be empty.");
        }

        return chatBotService.getResponses(question);
    }
}
