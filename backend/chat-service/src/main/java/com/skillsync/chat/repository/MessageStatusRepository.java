package com.skillsync.chat.repository;

import com.skillsync.chat.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, Long> {

    Optional<MessageStatus> findByMessageIdAndUserId(Long messageId, Long userId);

    List<MessageStatus> findByMessageId(Long messageId);

    long countByMessageIdAndStatus(Long messageId, MessageStatus.Status status);
}
