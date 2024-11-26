package com.chirp.server.services;

import com.chirp.server.models.Conversation;
import com.chirp.server.models.Message;
import com.chirp.server.repositories.ConversationRepository;
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
	private ConversationRepository conversationRepository;

	public Message saveMessage(String senderId , String receiverId , String content) {
		LocalDateTime timeStamp = LocalDateTime.now();
		String firstUserId = senderId.compareTo(receiverId) < 0 ? senderId : receiverId;
		String secondUserId = senderId.compareTo(receiverId) < 0 ? receiverId : senderId;

		Conversation conversation = conversationRepository.findByParticipants(Arrays.asList(firstUserId , secondUserId));

		Message message = new Message(senderId , receiverId , content , timeStamp);

		if (conversation != null) {
			conversation.getMessages().add(message);
		} else {
			conversation = new Conversation(Arrays.asList(firstUserId , secondUserId) ,
					List.of(message));
		}

		conversationRepository.save(conversation);
		logger.info("Message saved successfully between {} and {}" , senderId , receiverId);

		return message;
	}
}