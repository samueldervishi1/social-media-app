package com.chirp.server.controllers;

import com.chirp.server.models.Message;
import com.chirp.server.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/message")
public class MessageController {

	@Autowired
	private MessageService messageService;

	@PostMapping("/{senderId}/{receiverId}")
	public ResponseEntity<Message> saveMessage(
			@PathVariable String senderId ,
			@PathVariable String receiverId ,
			@RequestBody Message message) {
		System.out.println("Received message from senderId: " + senderId + ", receiverId: " + receiverId);
		Message savedMessage = messageService.saveMessage(senderId , receiverId , message.getContent());
		return ResponseEntity.ok(savedMessage);
	}
}