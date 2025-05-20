package com.chattr.server.controllers;

import com.chattr.server.models.Notifications;
import com.chattr.server.repositories.NotificationsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationsRepository notificationsRepository;

    public NotificationController(NotificationsRepository notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }

    @GetMapping("/{userId}")
    public List<Notifications> getUserNotifications(@PathVariable String userId) {
        return notificationsRepository.findAll()
                .stream()
                .filter(n -> n.getUserId().equals(userId))
                .toList();
    }

    @PostMapping("/mark-seen/{id}")
    public ResponseEntity<?> markAsSeen(@PathVariable String id) {
        Notifications notif = notificationsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setSeen(true);
        notificationsRepository.save(notif);
        return ResponseEntity.ok("Marked as seen");
    }
}