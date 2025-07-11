package com.chattr.server.controllers;

import com.chattr.server.models.Notifications;
import com.chattr.server.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}