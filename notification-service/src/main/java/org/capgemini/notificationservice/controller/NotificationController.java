package org.capgemini.notificationservice.controller;

import org.capgemini.notificationservice.entity.Notification;
import org.capgemini.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(service.getUserNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        boolean updated = service.markAsRead(id, authentication.getName());
        if (!updated) {
            return ResponseEntity.status(404).body("Notification not found for this user.");
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("/my/read")
    public ResponseEntity<?> markMyNotificationsAsRead(Authentication authentication) {
        service.markAllAsRead(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
