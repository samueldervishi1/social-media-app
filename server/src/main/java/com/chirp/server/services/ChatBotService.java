package com.chirp.server.services;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Collections;

@Service
public class ChatBotService {

	private final SummarizationService summarizationService;

	public ChatBotService(SummarizationService summarizationService) {
		this.summarizationService = summarizationService;
	}

	public Map<String, Object> getResponses(String input) {

		if (input == null || input.trim().isEmpty()) {
			return Collections.singletonMap("error" , "Input is null or empty");
		}

		try {
			String answer = summarizationService.summarize(input.toLowerCase());
			return Collections.singletonMap("answer" , answer);
		} catch (Exception e) {
			return Collections.singletonMap("error" , "Error processing request: " + e.getMessage());
		}
	}
}