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

import java.util.Map;

@Service
public class SummarizationService {

	private static final Logger logger = LoggerFactory.getLogger(SummarizationService.class);

	private static final String ERROR_MODEL_API_URL = "Model API URL is not configured properly.";
	private static final String ERROR_MODEL = "Model is not configured properly.";
	private static final String ERROR_UNEXPECTED = "An unexpected error occurred while summarizing content.";
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

	private final RestTemplate restTemplate;
	private final HttpHeaders headers;

	public SummarizationService() {
		this.restTemplate = new RestTemplate();
		this.headers = new HttpHeaders();
		this.headers.setContentType(MediaType.APPLICATION_JSON);
	}

	@PostConstruct
	private void validateConfigs() {
		if (!StringUtils.hasText(modelApiUrl) || !StringUtils.hasText(model)) {
			throw new IllegalArgumentException(!StringUtils.hasText(modelApiUrl) ? ERROR_MODEL_API_URL : ERROR_MODEL);
		}
		headers.set("Authorization" , "Bearer " + apiKey);
	}

	public String summarize(String message) {
		try {
			Map<String, Object> requestBody = Map.of(
					"model" , model ,
					"message" , message ,
					"temperature" , temperature ,
					"prompt_truncation" , promptTruncation
			);

			ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
					modelApiUrl ,
					HttpMethod.POST ,
					new HttpEntity<>(requestBody , headers) ,
					new ParameterizedTypeReference<>() {
					}
			);

			Map<String, Object> responseBody = responseEntity.getBody();
			if (responseBody == null || !responseBody.containsKey("text")) {
				logger.error("Unexpected response format received: {}" , responseBody);
				return ERROR_UNEXPECTED_FORMAT;
			}

			return (String) responseBody.get("text");

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