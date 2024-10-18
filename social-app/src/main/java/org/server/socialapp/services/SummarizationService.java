/**
 * @TODO You can use this code if you have a valid Google cloud billing account
 */
//package org.server.socialapp.services;
//
//import com.google.cloud.vertexai.VertexAI;
//import com.google.cloud.vertexai.api.GenerateContentResponse;
//import com.google.cloud.vertexai.generativeai.GenerativeModel;
//import com.google.cloud.vertexai.generativeai.ResponseHandler;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//
//
/// **
// * @author samuel
// */
//@Service
//public class SummarizationService {
//
//	@Value("${google.cloud.projectId}")
//	private String projectId;
//
//	@Value("${google.cloud.location}")
//	private String location;
//
//	@Value("${google.cloud.modelName}")
//	private String modelName;
//
//	public String summarize(String content) {
//		try (VertexAI vertexAI = new VertexAI(projectId , location)) {
//			GenerativeModel model = new GenerativeModel(modelName , vertexAI);
//			GenerateContentResponse response = model.generateContent(content);
//			return ResponseHandler.getText(response);
//		} catch (IllegalArgumentException e) {
//			if (e.getMessage() != null && e.getMessage().contains("The response is blocked due to safety reason")) {
//				return "The response is blocked due to safety reasons. Please try again later or contact support for assistance.";
//			} else {
//				e.printStackTrace();
//				return "An unexpected error occurred while summarizing content.";
//			}
//		} catch (IOException e) {
//			e.printStackTrace();
//			return "An unexpected error occurred while summarizing content.";
//		}
//	}
//}
//
//


package org.server.socialapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.client.RestClientException;

/**
 * @author samuel
 */


@Service
public class SummarizationService {

    @Value("${cohere.api.key}")
    private String apiKey;

    @Value("${cohere.api.url}")
    private String cohereApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String summarize(String message) {
        try {
            if (cohereApiUrl == null || cohereApiUrl.isEmpty()) {
                throw new IllegalArgumentException("Cohere API URL is not configured properly.");
            }
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "command-r-plus");
            requestBody.put("message", message);
            requestBody.put("temperature", 0.3);
            requestBody.put("prompt_truncation", "AUTO");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    cohereApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
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
