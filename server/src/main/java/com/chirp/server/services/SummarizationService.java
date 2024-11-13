package com.chirp.server.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SummarizationService {

	@Value("${model.api.key}")
	private String apiKey;

	@Value("${model.api.url}")
	private String modelApiUrl;

	@Value("${model.api.temperature}")
	private double temperature;

	@Value("${model.api.prompt_truncation}")
	private String promptTruncation;

	@Value("${model.api.model}")
	private String model;

	private final RestTemplate restTemplate = new RestTemplate();

	public String summarize(String message) {
		try {
			if (modelApiUrl == null || modelApiUrl.isEmpty()) {
				throw new IllegalArgumentException("Model API URL is not configured properly.");
			}
			if (model == null || model.isEmpty()) {
				throw new IllegalArgumentException("Model is not configured properly.");
			}

			Map<String, Object> requestBody = new HashMap<>();
			requestBody.put("model" , model);
			requestBody.put("message" , message);
			requestBody.put("temperature" , temperature);
			requestBody.put("prompt_truncation" , promptTruncation);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("Authorization" , "Bearer " + apiKey);

			HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody , headers);

			ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
					modelApiUrl ,
					HttpMethod.POST ,
					requestEntity ,
					new ParameterizedTypeReference<>() {
					}
			);

			Map<String, Object> responseBody = responseEntity.getBody();
			if (responseBody != null) {
				String text = (String) responseBody.get("text");
				return text != null ? text : "No response text available";
			} else {
				return "Unexpected response format";
			}
		} catch (IllegalArgumentException | RestClientException e) {
			return "An unexpected error occurred while summarizing content.";
		}
	}
}