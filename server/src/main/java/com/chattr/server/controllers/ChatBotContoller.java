package com.chattr.server.controllers;

import com.chattr.server.services.ChatBotService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class ChatBotContoller {

    private final ChatBotService chatBotService;

    public ChatBotContoller(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
    }

    @PostMapping("/quantum-query")
    public Map<String, Object> askQuestion(@RequestBody HashMap<String, String> request) {
        String question = request.get("message");
        return chatBotService.getResponses(question);
    }
}