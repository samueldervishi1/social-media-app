package com.chirp.server.controllers;

import com.chirp.server.models.History;
import com.chirp.server.models.QuestionAnswerPair;
import com.chirp.server.services.HistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/hyper-api/auranet/v2.1.5/echo-trail")
public class HistoryController {

	private final HistoryService historyService;

	public HistoryController(HistoryService historyService) {
		this.historyService = historyService;
	}


	@GetMapping("/all")
	public ResponseEntity<List<History>> getAllHistories() {
		try {
			List<History> histories = historyService.getAllHistories();
			return new ResponseEntity<>(histories , HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/shadow/{userId}")
	public ResponseEntity<?> getHistoryByUserId(@PathVariable String userId) {
		try {
			List<History> histories = historyService.getHistoryByUserId(userId);
			if (!histories.isEmpty()) {
				return new ResponseEntity<>(histories , HttpStatus.OK);
			} else {
				return new ResponseEntity<>("No history found for userId: " + userId , HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to fetch history" , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/ghost-link/{sessionId}")
	public ResponseEntity<?> getHistoryBySessionId(@PathVariable String sessionId) {
		try {
			Optional<History> historyOptional = historyService.getHistoryBySessionId(sessionId);
			if (historyOptional.isPresent()) {
				return new ResponseEntity<>(historyOptional.get() , HttpStatus.OK);
			} else {
				return new ResponseEntity<>("No history found for sessionId: " + sessionId , HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to fetch history" , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/datacast/{userId}/session/{sessionId}")
	public ResponseEntity<History> saveChatHistory(
			@PathVariable String userId ,
			@PathVariable String sessionId ,
			@RequestBody HashMap<String, String> request
	) {
		String message = request.get("message");
		String answer = request.get("answer");
		try {
			QuestionAnswerPair questionAnswerPair = new QuestionAnswerPair(message , answer);
			History savedHistory = historyService.saveHistory(sessionId , userId , List.of(questionAnswerPair));
			return new ResponseEntity<>(savedHistory , HttpStatus.CREATED);
		} catch (Exception e) {
			return new ResponseEntity<>(null , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/purge-session/{sessionId}")
	public ResponseEntity<String> deleteChatHistory(@PathVariable String sessionId) {
		try {
			historyService.deleteHistoryBySessionId(sessionId);
			return new ResponseEntity<>("Chat history deleted successfully" , HttpStatus.OK);
		} catch (IllegalArgumentException e) {
			return new ResponseEntity<>(e.getMessage() , HttpStatus.NOT_FOUND);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to delete chat history" , HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/wipe-uHistory/{userId}")
	public ResponseEntity<String> deleteChatHistoryForUserId(@PathVariable String userId) {
		try {
			historyService.deleteAllHistory(userId);
			return ResponseEntity.ok("Chat history deleted successfully");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to delete chat history");
		}
	}
}