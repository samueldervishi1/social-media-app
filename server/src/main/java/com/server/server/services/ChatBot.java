package com.server.server.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
public class ChatBot {

	private final SummaryService summarizationService;

	public ChatBot(SummaryService summarizationService) {
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