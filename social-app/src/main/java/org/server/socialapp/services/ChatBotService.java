/**
 * @TODO You can use this code if you have a valid Google cloud billing account
 */
//package org.server.socialapp.services;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.HashMap;
//
/// **
// * @author samuel
// */
//@Service
//public class ChatBotService {
//
//	private static final Logger logger = LoggerFactory.getLogger(ChatBotService.class);
//
//	@Autowired
//	private SummarizationService summarizationService;
//
//	private static final HashMap<String, String> responses = new HashMap<>();
//
//	static {
//		responses.put("hello" , "Hi there!");
//		responses.put("how are you" , "I'm a bot, I'm always fine!");
//		responses.put("bye" , "Goodbye!");
//	}
//
//	public HashMap<String, Object> getResponses(String input) {
//		logger.info("Input received: {}" , input);
//
//		try {
//			HashMap<String, Object> response = new HashMap<>();
//			if (input == null || input.trim().isEmpty()) {
//				response.put("error" , "Input is null or empty");
//				return response;
//			}
//			input = input.toLowerCase();
//			if (responses.containsKey(input)) {
//				response.put("answer" , createJsonResponse(responses.get(input)));
//			} else {
//				String summary = summarizationService.summarize(input);
//				response.put("answer" , formatSummary(summary));
//			}
//			logger.info("Response generated: {}" , response);
//			return response;
//		} catch (Exception e) {
//			logger.error("Error processing request: {}" , e.getMessage() , e);
//			HashMap<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error" , "Error processing request: " + e.getMessage());
//			return errorResponse;
//		}
//	}
//
//	private ArrayList<HashMap<String, Object>> createJsonResponse(String answer) {
//		ArrayList<HashMap<String, Object>> answerList = new ArrayList<>();
//		HashMap<String, Object> answerMap = new HashMap<>();
//		answerMap.put("content" , answer);
//		answerList.add(answerMap);
//		return answerList;
//	}
//
//	private ArrayList<HashMap<String, Object>> formatSummary(String summary) {
//		// Formatting a summary for easier reading
//		try {
//			String[] sections = summary.split("\n\n");
//			ArrayList<HashMap<String, Object>> answerList = new ArrayList<>();
//
//			for (String section : sections) {
//				section = section.replaceAll("\\*" , "")
//						.replaceAll("\\\\" , "")
//						.replaceAll("\"" , "")
//						.replaceAll("#" , "")
//						.replaceAll("\n" , "")
//						.trim();
//
//				HashMap<String, Object> answerMap = new HashMap<>();
//				answerMap.put("content" , section);
//				answerList.add(answerMap);
//			}
//
//			return answerList;
//		} catch (Exception e) {
//			logger.error("Error formatting summary: {}" , e.getMessage() , e);
//			ArrayList<HashMap<String, Object>> errorList = new ArrayList<>();
//			HashMap<String, Object> errorMap = new HashMap<>();
//			errorMap.put("error" , "Error formatting summary: " + e.getMessage());
//			errorList.add(errorMap);
//			return errorList;
//		}
//	}
//}


package org.server.socialapp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;

/**
 * @author samuel
 */
@Service
public class ChatBotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatBotService.class);

    @Autowired
    private SummarizationService summarizationService;

    private static final HashMap<String, String> responses = new HashMap<>();

    static {
        responses.put("hello", "Hi there!");
        responses.put("how are you", "I'm a bot, I'm always fine!");
        responses.put("bye", "Goodbye!");
    }

    @Autowired
    private HistoryService historyService;

    public HashMap<String, Object> getResponses(String input) {
        logger.info("Input received: {}", input);

        try {
            HashMap<String, Object> response = new HashMap<>();
            if (input == null || input.trim().isEmpty()) {
                response.put("error", "Input is null or empty");
                return response;
            }
            input = input.toLowerCase();
            if (responses.containsKey(input)) {
                response.put("answer", responses.get(input));
            } else {
                String answer = summarizationService.summarize(input);
                response.put("answer", answer);
            }
            logger.info("Response generated: {}", response);
            return response;
        } catch (Exception e) {
            logger.error("Error processing request: {}", e.getMessage(), e);
            HashMap<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error processing request: " + e.getMessage());
            return errorResponse;
        }
    }
}

