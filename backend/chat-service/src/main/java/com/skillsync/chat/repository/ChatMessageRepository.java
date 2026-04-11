package com.skillsync.chat.repository;

import com.skillsync.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByGroupIdAndDeletedFalseOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    List<ChatMessage> findByGroupIdAndPinnedTrueAndDeletedFalseOrderByCreatedAtDesc(Long groupId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.groupId = :groupId AND m.deleted = false")
    long countByGroupId(Long groupId);

    @Query("SELECT DISTINCT m.groupId FROM ChatMessage m WHERE m.senderId = :userId ORDER BY m.createdAt DESC")
    List<Long> findDistinctGroupIdsBySenderId(Long userId);
}
