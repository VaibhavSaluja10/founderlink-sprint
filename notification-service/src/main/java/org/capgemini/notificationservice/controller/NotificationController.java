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
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
