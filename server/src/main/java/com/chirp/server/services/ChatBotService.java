package com.chirp.server.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Collections;

@Service
public class ChatBotService {

	private static final Logger logger = LoggerFactory.getLogger(ChatBotService.class);
	private final SummarizationService summarizationService;

	public ChatBotService(SummarizationService summarizationService) {
		this.summarizationService = summarizationService;
	}

	public Map<String, Object> getResponses(String input) {
		logger.info("Input received: {}" , input);

		if (input == null || input.trim().isEmpty()) {
			return Collections.singletonMap("error" , "Input is null or empty");
		}

		try {
			String answer = summarizationService.summarize(input.toLowerCase());
			Map<String, Object> response = Collections.singletonMap("answer" , answer);
			logger.info("Response generated: {}" , response);
			return response;
		} catch (Exception e) {
			logger.error("Error processing request" , e);
			return Collections.singletonMap("error" , "Error processing request: " + e.getMessage());
		}
	}
}