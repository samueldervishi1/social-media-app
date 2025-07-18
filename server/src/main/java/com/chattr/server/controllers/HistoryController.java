package com.chattr.server.controllers;

import com.chattr.server.models.History;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.services.HistoryService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for managing user and session chat histories. */
@RestController
@RequestMapping("/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<History>> getAllHistories() {
        return ResponseEntity.ok(historyService.getAllHistories());
    }

    @GetMapping("/get/user/{userId}")
    public ResponseEntity<List<History>> getHistoryByUserId(@PathVariable String userId) {
        List<History> histories = historyService.getHistoryByUserId(userId);
        return histories.isEmpty()
                ? ResponseEntity.status(HttpStatus.NO_CONTENT).build()
                : ResponseEntity.ok(histories);
    }

    @GetMapping("/get/session/{sessionId}")
    public ResponseEntity<History> getHistoryBySessionId(@PathVariable String sessionId) {
        Optional<History> history = historyService.getHistoryBySessionId(sessionId);
        return history.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/save/{userId}/session/{sessionId}")
    public ResponseEntity<History> saveChatHistory(@PathVariable String userId, @PathVariable String sessionId,
            @RequestBody QuestionAnswerPair request) {
        History saved = historyService.saveHistory(sessionId, userId,
                List.of(new QuestionAnswerPair(request.getContent(), request.getAnswer())));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/delete/{sessionId}")
    public ResponseEntity<String> deleteChatHistory(@PathVariable String sessionId) {
        historyService.deleteHistoryBySessionId(sessionId);
        return ResponseEntity.ok("Chat history deleted successfully");
    }

    @DeleteMapping("/delete/user/{userId}")
    public ResponseEntity<String> deleteChatHistoryForUserId(@PathVariable String userId) {
        historyService.deleteAllHistory(userId);
        return ResponseEntity.ok("Chat history deleted successfully");
    }
}
