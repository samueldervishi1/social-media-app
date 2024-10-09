package org.server.socialapp.controllers;

import org.server.socialapp.models.Message;
import org.server.socialapp.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/{senderId}/{receiverId}")
    public Message saveMessage(
            @PathVariable String senderId,
            @PathVariable String receiverId,
            @RequestBody String content) {
        System.out.println("Received message from senderId: " + senderId + ", receiverId: " + receiverId);
        return messageService.saveMessage(senderId, receiverId, content);
    }
}
