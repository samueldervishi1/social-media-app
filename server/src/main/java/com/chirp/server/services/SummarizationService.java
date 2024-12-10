package com.chirp.server.services;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SummarizationService {

	private static final Logger logger = LoggerFactory.getLogger(SummarizationService.class);

	private static final String ERROR_MODEL_API_URL = "Model API URL is not configured properly.";
	private static final String ERROR_MODEL = "Model is not configured properly.";
	private static final String ERROR_UNEXPECTED = "An unexpected error occurred while summarizing content.";
	private static final String ERROR_NO_TEXT = "No response text available";
	private static final String ERROR_UNEXPECTED_FORMAT = "Unexpected response format";

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

	@PostConstruct
	private void validateConfigs() {
		if (!StringUtils.hasText(modelApiUrl)) {
			throw new IllegalArgumentException(ERROR_MODEL_API_URL);
		}

		if (!StringUtils.hasText(model)) {
			throw new IllegalArgumentException(ERROR_MODEL);
		}
	}

	public String summarize(String message) {
		try {
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

			if (responseEntity.getBody() == null || !responseEntity.getBody().containsKey("text")) {
				logger.error("Unexpected response format received: {}" , responseEntity.getBody());
				return ERROR_UNEXPECTED_FORMAT;
			}

			return Optional.ofNullable(responseEntity.getBody())
					.map(responseBody -> (String) responseBody.get("text"))
					.orElse(ERROR_NO_TEXT);

		} catch (HttpStatusCodeException e) {
			logger.error("HTTP Status: {} - Error Response: {}" , e.getStatusCode() , e.getResponseBodyAsString() , e);
			return ERROR_UNEXPECTED;
		} catch (RestClientException e) {
			logger.error("RestClientException occurred: {}" , e.getMessage() , e);
			return ERROR_UNEXPECTED;
		} catch (Exception e) {
			logger.error("Unexpected error: {}" , e.getMessage() , e);
			return ERROR_UNEXPECTED;
		}
	}
}