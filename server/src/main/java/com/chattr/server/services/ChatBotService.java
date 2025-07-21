package com.chattr.server.services;

import com.chattr.server.models.Messages;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

/**
 * Service responsible for communicating with an external AI model API to get
 * chatbot responses.
 */
@Slf4j
@Service
public class ChatBotService {

    private final LoggingService loggingService;
    private final RestTemplate restTemplate;
    private final HttpHeaders headers;

    public ChatBotService(LoggingService loggingService) {
        this.restTemplate = new RestTemplate();
        this.headers = new HttpHeaders();
        this.headers.setContentType(MediaType.APPLICATION_JSON);
        this.loggingService = loggingService;
    }

    @PostConstruct
    private void validateConfigs() {
        if (!StringUtils.hasText(modelApiUrl)) {
            throw new IllegalArgumentException(Messages.ERROR_MODEL_API_URL);
        }
        if (!StringUtils.hasText(model)) {
            throw new IllegalArgumentException(Messages.ERROR_MODEL);
        }
        headers.setBearerAuth(apiKey);
    }

    public Map<String, Object> getResponses(String message) {
        try {
            Map<String, Object> requestBody = buildRequestBody(message);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(modelApiUrl, HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers), new ParameterizedTypeReference<>() {
                    });

            loggingService.logInfo("ChatBotService", "getResponses", "Model API response: " + response.getBody());
            return parseModelResponse(response.getBody(), message);

        } catch (Exception e) {
            loggingService.logError("ChatBotService", "getResponses", "Error while calling model API", e);
            return Map.of("answer", Messages.ERROR_UNEXPECTED);
        }
    }

    private Map<String, Object> buildRequestBody(String message) {
        return Map.of("model", model, "messages",
                List.of(Map.of("role", "user", "content", List.of(Map.of("type", "text", "text", message)))));
    }

    private Map<String, Object> parseModelResponse(Map<String, Object> responseBody, String userMessage) {
        if (responseBody == null || !responseBody.containsKey("choices")) {
            return Map.of("answer", Messages.ERROR_UNEXPECTED_FORMAT);
        }

        List<?> choices = (List<?>) responseBody.get("choices");
        if (choices.isEmpty()) {
            return Map.of("answer", "No response received.");
        }

        Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
        Map<?, ?> messageMap = (Map<?, ?>) firstChoice.get("message");

        if (messageMap == null || !messageMap.containsKey("content")) {
            return Map.of("answer", Messages.ERROR_UNEXPECTED_FORMAT);
        }

        String answer = (String) messageMap.get("content");
        return Map.of("message", userMessage, "answer", answer);
    }

    @Value("${model.api.key}")
    private String apiKey;

    @Value("${model.api.url}")
    private String modelApiUrl;

    @Value("${model.api.model}")
    private String model;
}
