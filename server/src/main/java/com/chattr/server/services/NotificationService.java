package com.chattr.server.services;

import com.chattr.server.models.NotificationMessage;
import com.chattr.server.models.Notifications;
import com.chattr.server.repositories.NotificationsRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationsRepository notificationsRepository;
    private final ActivityLogService activityLogService;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationsRepository notificationsRepository, ActivityLogService activityLogService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationsRepository = notificationsRepository;
        this.activityLogService = activityLogService;
    }

    public void sendFollowNotification(String toUserId, String followerUsername) {
        String message = followerUsername + " started following you.";

        // Store in Mongo
        Notifications dbNotification = new Notifications();
        dbNotification.setUserId(toUserId);
        dbNotification.setMessage(message);
        dbNotification.setType("FOLLOW");
        dbNotification.setSeen(false);
        dbNotification.setTimestamp(LocalDateTime.now());
        notificationsRepository.save(dbNotification);
        activityLogService.log(toUserId, "FOLLOW_NOTIFICATION", message);

        // Send real-time via WebSocket
        NotificationMessage notification = new NotificationMessage();
        notification.setToUserId(toUserId);
        notification.setMessage(message);
        notification.setType("FOLLOW");
        activityLogService.log(toUserId, "FOLLOW_NOTIFICATION", message);

        messagingTemplate.convertAndSend("/topic/notifications/" + toUserId, notification);
    }
}