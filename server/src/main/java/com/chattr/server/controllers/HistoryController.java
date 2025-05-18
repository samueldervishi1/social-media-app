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
		return ResponseEntity.ok(historyService.getAllHistories());
	}

	/**
	 * Get all chat history for a specific user.
	 *
	 * @param userId user identifier
	 * @return list of histories or 204 if none found
	 */
	@GetMapping("/get/user/{userId}")
	public ResponseEntity<List<History>> getHistoryByUserId(@PathVariable String userId) {
		List<History> histories = historyService.getHistoryByUserId(userId);
		return histories.isEmpty()
				? ResponseEntity.status(HttpStatus.NO_CONTENT).build()
				: ResponseEntity.ok(histories);
	}

	/**
	 * Get a single chat history record by session ID.
	 *
	 * @param sessionId session identifier
	 * @return the history or 404 if not found
	 */
	@GetMapping("/get/session/{sessionId}")
	public ResponseEntity<History> getHistoryBySessionId(@PathVariable String sessionId) {
		Optional<History> history = historyService.getHistoryBySessionId(sessionId);
		return history
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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
		History saved = historyService.saveHistory(sessionId , userId ,
				List.of(new QuestionAnswerPair(request.getContent() , request.getAnswer())));

		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

	/**
	 * Delete a chat history by session ID.
	 *
	 * @param sessionId session identifier
	 * @return success message
	 */
	@DeleteMapping("/delete/{sessionId}")
	public ResponseEntity<String> deleteChatHistory(@PathVariable String sessionId) {
		historyService.deleteHistoryBySessionId(sessionId);
		return ResponseEntity.ok("Chat history deleted successfully");
	}

	/**
	 * Delete all chat history records for a specific user.
	 *
	 * @param userId user identifier
	 * @return success message
	 */
	@DeleteMapping("/delete/user/{userId}")
	public ResponseEntity<String> deleteChatHistoryForUserId(@PathVariable String userId) {
		historyService.deleteAllHistory(userId);
		return ResponseEntity.ok("Chat history deleted successfully");
	}
}