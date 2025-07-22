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
    private final LoggingService loggingService;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationsRepository notificationsRepository,
            LoggingService loggingService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationsRepository = notificationsRepository;
        this.loggingService = loggingService;
    }

    public void sendFollowNotification(String toUserId, String followerUsername) {
        String sessionId = loggingService.getCurrentSessionId();
        String message = followerUsername + " started following you.";

        try {
            loggingService.logInfo("NotificationService", "sendFollowNotification", String
                    .format("Preparing to send follow notification from %s to userId %s", followerUsername, toUserId));

            loggingService.logDebug("NotificationService", "sendFollowNotification",
                    String.format("Notification message: %s", message));

            Notifications dbNotification = new Notifications();
            dbNotification.setUserId(toUserId);
            dbNotification.setMessage(message);
            dbNotification.setType("FOLLOW");
            dbNotification.setSeen(false);
            dbNotification.setTimestamp(LocalDateTime.now());

            Notifications savedNotification = notificationsRepository.save(dbNotification);
            loggingService.logDebug("NotificationService", "sendFollowNotification",
                    String.format("Follow notification saved to database with ID: %s", savedNotification.getId()));

            // Send real-time via WebSocket
            NotificationMessage notification = new NotificationMessage();
            notification.setToUserId(toUserId);
            notification.setMessage(message);
            notification.setType("FOLLOW");

            messagingTemplate.convertAndSend("/topic/notifications/" + toUserId, notification);
            loggingService.logDebug("NotificationService", "sendFollowNotification", String
                    .format("Real-time notification sent via WebSocket to topic: /topic/notifications/%s", toUserId));

            loggingService.logSecurityEvent("FOLLOW_NOTIFICATION_SENT", followerUsername, sessionId,
                    String.format("Follow notification sent from %s to user %s", followerUsername, toUserId));

            loggingService.logInfo("NotificationService", "sendFollowNotification",
                    String.format("Follow notification successfully delivered to user %s", toUserId));

        } catch (Exception e) {
            loggingService.logSecurityEvent("FOLLOW_NOTIFICATION_FAILED", followerUsername, sessionId,
                    String.format("Failed to send follow notification from %s to user %s: %s", followerUsername,
                            toUserId, e.getMessage()));

            loggingService.logError("NotificationService", "sendFollowNotification",
                    String.format("Failed to send follow notification from %s to user %s", followerUsername, toUserId),
                    e);

            loggingService.logWarn("NotificationService", "sendFollowNotification",
                    "Follow notification failed but follow action will continue");
        }
    }

    public void sendFollowAcceptedNotification(String toUserId, String accepterUsername) {
        String sessionId = loggingService.getCurrentSessionId();
        String message = accepterUsername + " accepted your follow request.";

        try {
            loggingService.logInfo("NotificationService", "sendFollowAcceptedNotification", String.format(
                    "Preparing to send follow accepted notification from %s to userId %s", accepterUsername, toUserId));

            loggingService.logDebug("NotificationService", "sendFollowAcceptedNotification",
                    String.format("Notification message: %s", message));

            Notifications dbNotification = new Notifications();
            dbNotification.setUserId(toUserId);
            dbNotification.setMessage(message);
            dbNotification.setType("FOLLOW_ACCEPTED");
            dbNotification.setSeen(false);
            dbNotification.setTimestamp(LocalDateTime.now());

            Notifications savedNotification = notificationsRepository.save(dbNotification);
            loggingService.logDebug("NotificationService", "sendFollowAcceptedNotification", String
                    .format("Follow accepted notification saved to database with ID: %s", savedNotification.getId()));

            // Send real-time via WebSocket
            NotificationMessage notification = new NotificationMessage();
            notification.setToUserId(toUserId);
            notification.setMessage(message);
            notification.setType("FOLLOW_ACCEPTED");

            messagingTemplate.convertAndSend("/topic/notifications/" + toUserId, notification);
            loggingService.logDebug("NotificationService", "sendFollowAcceptedNotification", String
                    .format("Real-time notification sent via WebSocket to topic: /topic/notifications/%s", toUserId));

            loggingService.logSecurityEvent("FOLLOW_ACCEPTED_NOTIFICATION_SENT", accepterUsername, sessionId,
                    String.format("Follow accepted notification sent from %s to user %s", accepterUsername, toUserId));

            loggingService.logInfo("NotificationService", "sendFollowAcceptedNotification",
                    String.format("Follow accepted notification successfully delivered to user %s", toUserId));

        } catch (Exception e) {
            loggingService.logSecurityEvent("FOLLOW_ACCEPTED_NOTIFICATION_FAILED", accepterUsername, sessionId,
                    String.format("Failed to send follow accepted notification from %s to user %s: %s",
                            accepterUsername, toUserId, e.getMessage()));

            loggingService.logError("NotificationService", "sendFollowAcceptedNotification", String.format(
                    "Failed to send follow accepted notification from %s to user %s", accepterUsername, toUserId), e);

            loggingService.logWarn("NotificationService", "sendFollowAcceptedNotification",
                    "Follow accepted notification failed but follow acceptance will continue");
        }
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
