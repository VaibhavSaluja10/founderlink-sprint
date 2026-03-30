package org.capgemini.notificationservice.service;

import org.capgemini.notificationservice.entity.Notification;
import org.capgemini.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    public Notification createNotification(String userId, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .status("UNREAD")
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return repository.findByUserId(userId);
    }

    public void markAsRead(Long notificationId) {
        repository.findById(notificationId).ifPresent(notification -> {
            notification.setStatus("READ");
            repository.save(notification);
        });
    }
}
