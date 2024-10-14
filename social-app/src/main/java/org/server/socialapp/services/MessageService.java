package org.server.socialapp.services;

import org.server.socialapp.exceptions.InternalServerErrorException;
import org.server.socialapp.models.Conversation;
import org.server.socialapp.models.Message;
import org.server.socialapp.repositories.ConversationRepository;
import org.server.socialapp.repositories.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    public Message saveMessage(String senderId, String receiverId, String content) {
        try {
            LocalDateTime timeStamp = LocalDateTime.now();
            String firstUserId = senderId.compareTo(receiverId) < 0 ? senderId : receiverId;
            String secondUserId = senderId.compareTo(receiverId) < 0 ? receiverId : senderId;
            Conversation conversation = conversationRepository.findByParticipants(Arrays.asList(firstUserId, secondUserId));

            if (conversation != null) {
                conversation.getMessages().add(new Message(senderId, receiverId, content, timeStamp));
            } else {
                conversation = new Conversation(Arrays.asList(firstUserId, secondUserId),
                        List.of(new Message(senderId, receiverId, content, timeStamp)));
            }

            conversationRepository.save(conversation);
            logger.info("Message saved successfully between {} and {}", senderId, receiverId);

            return new Message(senderId, receiverId, content, timeStamp);
        } catch (Exception e) {
            logger.error("Failed to save message from {} to {}: {}", senderId, receiverId, e.getMessage());
            throw new InternalServerErrorException("Error saving message");
        }
    }
}
