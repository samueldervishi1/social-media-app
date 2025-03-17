package com.chirp.server.controllers;

import com.chirp.server.services.ChatBotService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/hyper-api/auranet/v2.1.5/quantum-query")
public class ChatBotController {

	private final ChatBotService chatBotService;

	public ChatBotController(ChatBotService chatBotService) {
		this.chatBotService = chatBotService;
	}

	@PostMapping
	public Map<String, Object> askQuestion(@RequestBody HashMap<String, String> request) {
		String question = request.get("message");
		return chatBotService.getResponses(question);
	}
}