package com.chattr.server.services;

import com.chattr.server.models.NotificationMessage;
import com.chattr.server.models.Notifications;
import com.chattr.server.repositories.NotificationsRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationsRepository notificationsRepository;

    public NotificationService(SimpMessagingTemplate messagingTemplate,
            NotificationsRepository notificationsRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationsRepository = notificationsRepository;
    }

    public void sendFollowNotification(String toUserId, String followerUsername) {
        String message = followerUsername + " started following you.";

        System.out.println("[NotificationService] Sending TO userId: " + toUserId);
        System.out.println("[NotificationService] From username: " + followerUsername);
        System.out.println("[NotificationService] Message: " + message);

        // Store in Mongo
        Notifications dbNotification = new Notifications();
        dbNotification.setUserId(toUserId);
        dbNotification.setMessage(message);
        dbNotification.setType("FOLLOW");
        dbNotification.setSeen(false);
        dbNotification.setTimestamp(LocalDateTime.now());
        notificationsRepository.save(dbNotification);

        // Send real-time via WebSocket
        NotificationMessage notification = new NotificationMessage();
        notification.setToUserId(toUserId);
        notification.setMessage(message);
        notification.setType("FOLLOW");
        messagingTemplate.convertAndSend("/topic/notifications/" + toUserId, notification);
    }

    public void sendFollowAcceptedNotification(String toUserId, String accepterUsername) {
        String message = accepterUsername + " accepted your follow request.";

        Notifications dbNotification = new Notifications();
        dbNotification.setUserId(toUserId);
        dbNotification.setMessage(message);
        dbNotification.setType("FOLLOW_ACCEPTED");
        dbNotification.setSeen(false);
        dbNotification.setTimestamp(LocalDateTime.now());
        notificationsRepository.save(dbNotification);

        NotificationMessage notification = new NotificationMessage();
        notification.setToUserId(toUserId);
        notification.setMessage(message);
        notification.setType("FOLLOW_ACCEPTED");

        messagingTemplate.convertAndSend("/topic/notifications/" + toUserId, notification);
    }

    public List<Notifications> getNotifications(String userId) {
        return notificationsRepository.findAll().stream().filter(n -> n.getUserId().equals(userId)).toList();
    }
    public void markAsSeen(String id) {
        Notifications notif = notificationsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setSeen(true);
        notificationsRepository.save(notif);
    }

    public void markAllAsSeenForUser(String userId) {
        List<Notifications> userNotifications = notificationsRepository.findAll().stream()
                .filter(n -> n.getUserId().equals(userId) && !n.isSeen()).toList();

        for (Notifications notification : userNotifications) {
            notification.setSeen(true);
            notificationsRepository.save(notification);
        }
    }
}
