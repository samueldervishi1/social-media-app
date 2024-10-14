package org.server.socialapp.controllers;

import org.server.socialapp.models.Message;
import org.server.socialapp.services.MessageService;
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
            @PathVariable String senderId,
            @PathVariable String receiverId,
            @RequestBody Message message) {
        System.out.println("Received message from senderId: " + senderId + ", receiverId: " + receiverId);
        Message savedMessage = messageService.saveMessage(senderId, receiverId, message.getContent());
        return ResponseEntity.ok(savedMessage);
    }
}
