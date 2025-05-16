package com.chattr.server.controllers;

import com.chattr.server.services.ChatBotService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller that handles chatbot interactions.
 */
@RestController
@RequestMapping("/chatbot")
public class ChatBotController {

	private final ChatBotService chatBotService;

	/**
	 * Constructor injection of the ChatBotService.
	 *
	 * @param chatBotService the service responsible for chatbot responses
	 */
	public ChatBotController(ChatBotService chatBotService) {
		this.chatBotService = chatBotService;
	}

	/**
	 * Handles POST requests to /chatbot/query and returns the chatbot's response.
	 *
	 * @param requestBody JSON body containing a "message" key
	 * @return a map with the chatbot's response
	 */
	@PostMapping("/query")
	public Map<String, Object> askQuestion(@RequestBody Map<String, String> requestBody) {
		// Extract the question message from the request body
		String question = requestBody.getOrDefault("message" , "").trim();

		// Short-circuit if message is missing or empty
		if (question.isEmpty()) {
			return Map.of("error" , "Message cannot be empty.");
		}

		// Delegate to the ChatBotService and return the response
		return chatBotService.getResponses(question);
	}
}