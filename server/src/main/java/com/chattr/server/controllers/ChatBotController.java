package com.chattr.server.controllers;

import com.chattr.server.services.ActivityLogService;
import com.chattr.server.services.ChatBotService;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST controller that handles chatbot interactions. */
@RestController
@RequestMapping("/chatbot")
public class ChatBotController {

  private final ChatBotService chatBotService;
  private final ActivityLogService activityLogService;

  public ChatBotController(ChatBotService chatBotService, ActivityLogService activityLogService) {
    this.chatBotService = chatBotService;
    this.activityLogService = activityLogService;
  }

  @PostMapping("/query")
  public Map<String, Object> askQuestion(@RequestBody Map<String, String> requestBody) {
    // Extract the question message from the request body
    String question = requestBody.getOrDefault("message", "").trim();

    // Short-circuit if a message is missing or empty
    if (question.isEmpty()) {
      return Map.of("error", "Message cannot be empty.");
    }

    activityLogService.log(
        question, "CHAT_ASK_QUESTION", "Sending question to chatbot: " + question + ".");

    // Delegate to the ChatBotService and return the response
    return chatBotService.getResponses(question);
  }
}
