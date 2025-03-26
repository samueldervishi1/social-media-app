package com.server.server.controllers;

import com.server.server.services.ChatBot;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class ChatBotContoller {

	private final ChatBot chatBotService;

	public ChatBotContoller(ChatBot chatBotService) {
		this.chatBotService = chatBotService;
	}

	@PostMapping("/quantum-query")
	public Map<String, Object> askQuestion(@RequestBody HashMap<String, String> request) {
		String question = request.get("message");
		return chatBotService.getResponses(question);
	}
}