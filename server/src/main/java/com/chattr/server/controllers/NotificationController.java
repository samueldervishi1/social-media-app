package com.chattr.server.controllers;

import com.chattr.server.models.Notifications;
import com.chattr.server.services.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public List<Notifications> getUserNotifications(@PathVariable String userId) {
        return notificationService.getNotifications(userId);
    }

    @PostMapping("/mark-seen/{id}")
    public ResponseEntity<?> markAsSeen(@PathVariable String id) {
        notificationService.markAsSeen(id);
        return ResponseEntity.ok("Marked as seen");
    }

    @PostMapping("/mark-all-seen/{userId}")
    public ResponseEntity<?> markAllAsSeen(@PathVariable String userId) {
        notificationService.markAllAsSeenForUser(userId);
        return ResponseEntity.ok("All notifications marked as seen");
    }
}
