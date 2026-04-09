package com.skillsync.user.repository;

import com.skillsync.user.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findByIsReadFalseOrderByTimestampDesc();
    List<AdminNotification> findAllByOrderByTimestampDesc();
}
