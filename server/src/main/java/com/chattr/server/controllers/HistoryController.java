package com.chattr.server.controllers;

import com.chattr.server.models.History;
import com.chattr.server.models.QuestionAnswerPair;
import com.chattr.server.services.HistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing user and session chat histories.
 */
@RestController
@RequestMapping("/history")
public class HistoryController {

	private final HistoryService historyService;

	/**
	 * Constructor-based dependency injection for HistoryService.
	 *
	 * @param historyService service layer for chat history operations
	 */
	public HistoryController(HistoryService historyService) {
		this.historyService = historyService;
	}

	/**
	 * Get all chat history records in the system.
	 *
	 * @return list of all histories
	 */
	@GetMapping("/all")
	public ResponseEntity<List<History>> getAllHistories() {
		try {
			return ResponseEntity.ok(historyService.getAllHistories());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Get all chat history for a specific user.
	 *
	 * @param userId user identifier
	 * @return list of histories or 404 if none found
	 */
	@GetMapping("/get/user/{userId}")
	public ResponseEntity<?> getHistoryByUserId(@PathVariable String userId) {
		try {
			List<History> histories = historyService.getHistoryByUserId(userId);
			return histories.isEmpty()
					? ResponseEntity.status(HttpStatus.NOT_FOUND).body("No history found for userId: " + userId)
					: ResponseEntity.ok(histories);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch history");
		}
	}

	/**
	 * Get a single chat history record by session ID.
	 *
	 * @param sessionId session identifier
	 * @return the history or 404 if not found
	 */
	@GetMapping("/get/session/{sessionId}")
	public ResponseEntity<?> getHistoryBySessionId(@PathVariable String sessionId) {
		try {
			Optional<History> history = historyService.getHistoryBySessionId(sessionId);
			return history
					.<ResponseEntity<?>>map(ResponseEntity::ok)
					.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
							.body("No history found for sessionId: " + sessionId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch history");
		}
	}

	/**
	 * Save a new chat history record for a given user and session.
	 *
	 * @param userId    user identifier
	 * @param sessionId session identifier
	 * @param request   contains the question and answer pair
	 * @return the saved history object
	 */
	@PostMapping("/save/{userId}/session/{sessionId}")
	public ResponseEntity<History> saveChatHistory(
			@PathVariable String userId ,
			@PathVariable String sessionId ,
			@RequestBody QuestionAnswerPair request
	) {
		try {
			History saved = historyService.saveHistory(sessionId , userId ,
					List.of(new QuestionAnswerPair(request.getContent() , request.getAnswer())));

			return ResponseEntity.status(HttpStatus.CREATED).body(saved);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Delete a chat history by session ID.
	 *
	 * @param sessionId session identifier
	 * @return success message or error
	 */
	@DeleteMapping("/delete/{sessionId}")
	public ResponseEntity<String> deleteChatHistory(@PathVariable String sessionId) {
		try {
			historyService.deleteHistoryBySessionId(sessionId);
			return ResponseEntity.ok("Chat history deleted successfully");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete chat history");
		}
	}

	/**
	 * Delete all chat history records for a specific user.
	 *
	 * @param userId user identifier
	 * @return success or error message
	 */
	@DeleteMapping("/delete/user/{userId}")
	public ResponseEntity<String> deleteChatHistoryForUserId(@PathVariable String userId) {
		try {
			historyService.deleteAllHistory(userId);
			return ResponseEntity.ok("Chat history deleted successfully");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete chat history");
		}
	}
}