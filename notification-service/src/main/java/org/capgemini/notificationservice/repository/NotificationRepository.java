package org.capgemini.notificationservice.repository;

import org.capgemini.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(String userId);
    List<Notification> findByUserIdAndStatus(String userId, String status);
    java.util.Optional<Notification> findByIdAndUserId(Long id, String userId);
}
