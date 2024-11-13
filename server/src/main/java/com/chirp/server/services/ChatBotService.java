package com.chirp.server.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class ChatBotService {

	private static final Logger logger = LoggerFactory.getLogger(ChatBotService.class);

	@Autowired
	private SummarizationService summarizationService;

	public HashMap<String, Object> getResponses(String input) {
		logger.info("Input received: {}" , input);

		try {
			HashMap<String, Object> response = new HashMap<>();
			if (input == null || input.trim().isEmpty()) {
				response.put("error" , "Input is null or empty");
				return response;
			}
			input = input.toLowerCase();
			String answer = summarizationService.summarize(input);
			response.put("answer" , answer);

			logger.info("Response generated: {}" , response);
			return response;
		} catch (Exception e) {
			logger.error("Error processing request: {}" , e.getMessage() , e);
			HashMap<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error" , "Error processing request: " + e.getMessage());
			return errorResponse;
		}
	}
}