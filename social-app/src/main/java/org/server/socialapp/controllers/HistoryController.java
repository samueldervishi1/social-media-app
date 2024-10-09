package org.server.socialapp.controllers;

import org.server.socialapp.models.History;
import org.server.socialapp.models.QuestionAnswerPair;
import org.server.socialapp.services.HistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {

    private static final Logger logger = LoggerFactory.getLogger(HistoryController.class);

    @Autowired
    private HistoryService historyService;

    @PostMapping("/save/{userId}")
    public ResponseEntity<?> saveChatHistory(@PathVariable String userId, @RequestBody HashMap<String, String> request) {
        String sessionId = UUID.randomUUID().toString();
        String message = request.get("message");
        String answer = request.get("answer");

        logger.info("Received request to save chat history for userId: {}", userId);

        try {
            QuestionAnswerPair questionAnswerPair = new QuestionAnswerPair(message, answer);
            History savedHistory = historyService.saveHistory(sessionId, userId, List.of(questionAnswerPair));

            logger.info("Successfully saved chat history for userId: {}, sessionId: {}", userId, sessionId);
            return new ResponseEntity<>(savedHistory, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error saving chat history for userId: {}, sessionId: {}. Error: {}", userId, sessionId, e.getMessage());
            return new ResponseEntity<>("Failed to save chat history", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllHistories() {
        try {
            List<History> histories = historyService.getAllHistories();
            return new ResponseEntity<>(histories, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching all histories. Error: {}", e.getMessage());
            return new ResponseEntity<>("Failed to fetch histories", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getHistoryByUserId(@PathVariable String userId) {
        try {
            Optional<History> historyOptional = historyService.getHistoryByUserId(userId);
            if (historyOptional.isPresent()) {
                return new ResponseEntity<>(historyOptional.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No history found for userId: " + userId, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error fetching history for userId: {}. Error: {}", userId, e.getMessage());
            return new ResponseEntity<>("Failed to fetch history", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get/sessionId/{sessionId}")
    public ResponseEntity<?> getHistoryBySessionId(@PathVariable String sessionId) {
        try {
            Optional<History> historyOptional = historyService.getHistoryBySessionId(sessionId);
            if (historyOptional.isPresent()) {
                return new ResponseEntity<>(historyOptional.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No history found for sessionId: " + sessionId, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error fetching history for sessionId: {}. Error: {}", sessionId, e.getMessage());
            return new ResponseEntity<>("Failed to fetch history", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
