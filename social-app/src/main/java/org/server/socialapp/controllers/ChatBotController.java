package org.server.socialapp.controllers;

import org.server.socialapp.services.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/ask")
public class ChatBotController {
    @Autowired
    private ChatBotService chatBotService;

    @PostMapping
    public HashMap<String, Object> askQuestion(@RequestBody HashMap<String, String> request) {
        String question = request.get("message");
        return chatBotService.getResponses(question);
    }
}