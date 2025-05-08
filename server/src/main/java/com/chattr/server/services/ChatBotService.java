package com.chattr.server.services;

import com.chattr.server.models.Codes;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatBotService {

    @Value("${model.api.key}")
    private String apiKey;

    @Value("${model.api.url}")
    private String modelApiUrl;

    @Value("${model.api.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final HttpHeaders headers;

    public ChatBotService() {
        this.restTemplate = new RestTemplate();
        this.headers = new HttpHeaders();
        this.headers.setContentType(MediaType.APPLICATION_JSON);
    }

    @PostConstruct
    private void validateConfigs() {
        if (!StringUtils.hasText(modelApiUrl) || !StringUtils.hasText(model)) {
            throw new IllegalArgumentException(!StringUtils.hasText(modelApiUrl) ? Codes.ERROR_MODEL_API_URL : Codes.ERROR_MODEL);
        }
        headers.set("Authorization", "Bearer " + apiKey);
    }

    public Map<String, Object> getResponses(String message) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of(
                                    "role", "user",
                                    "content", List.of(
                                            Map.of("type", "text", "text", message)
                                    )
                            )
                    )
            );

            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    modelApiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    new ParameterizedTypeReference<>() {
                    }
            );

            Map<String, Object> responseBody = responseEntity.getBody();
            if (responseBody == null || !responseBody.containsKey("choices")) {
                return Map.of("answer", Codes.ERROR_UNEXPECTED_FORMAT);
            }

            List<?> choices = (List<?>) responseBody.get("choices");
            if (choices.isEmpty()) {
                return Map.of("answer", "No response received.");
            }

            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> messageMap = (Map<?, ?>) firstChoice.get("message");

            String answer = (String) messageMap.get("content");
            return Map.of("message", message, "answer", answer);

        } catch (Exception e) {
            log.error("Error while calling model API", e);
            return Map.of("answer", Codes.ERROR_UNEXPECTED);
        }
    }
}