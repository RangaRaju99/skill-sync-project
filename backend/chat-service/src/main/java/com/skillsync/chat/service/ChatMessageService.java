package com.skillsync.chat.service;

import com.skillsync.chat.dto.ChatMessageDto;
import com.skillsync.chat.dto.ChatMessageRequest;
import com.skillsync.chat.entity.ChatMessage;
import com.skillsync.chat.entity.MessageStatus;
import com.skillsync.chat.repository.ChatMessageRepository;
import com.skillsync.chat.repository.MessageStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final MessageStatusRepository messageStatusRepository;

    /**
     * Send a new text message.
     */
    @Transactional
    public ChatMessageDto sendMessage(ChatMessageRequest request, Long senderId, String senderName) {
        ChatMessage message = ChatMessage.builder()
                .groupId(request.getGroupId())
                .senderId(senderId)
                .senderName(senderName)
                .content(request.getContent())
                .type(request.getType() != null ?
                        ChatMessage.MessageType.valueOf(request.getType()) :
                        ChatMessage.MessageType.TEXT)
                .replyToId(request.getReplyToId())
                .build();

        message = chatMessageRepository.save(message);
        log.info("[Chat] Message sent: id={}, group={}, sender={}", message.getId(), message.getGroupId(), senderId);

        return toDto(message);
    }

    /**
     * Save a file message (after Azure Blob upload).
     */
    @Transactional
    public ChatMessageDto sendFileMessage(Long groupId, Long senderId, String senderName,
                                          String fileUrl, String fileName, Long fileSize,
                                          ChatMessage.MessageType type) {
        ChatMessage message = ChatMessage.builder()
                .groupId(groupId)
                .senderId(senderId)
                .senderName(senderName)
                .content(fileName)
                .type(type)
                .fileUrl(fileUrl)
                .fileName(fileName)
                .fileSize(fileSize)
                .build();

        message = chatMessageRepository.save(message);
        log.info("[Chat] File message sent: id={}, type={}, file={}", message.getId(), type, fileName);

        return toDto(message);
    }

    /**
     * Get paginated messages for a group (lazy loading).
     */
    public Page<ChatMessageDto> getMessages(Long groupId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return chatMessageRepository.findByGroupIdAndDeletedFalseOrderByCreatedAtDesc(groupId, pageable)
                .map(this::toDto);
    }

    /**
     * Get pinned messages for a group.
     */
    public List<ChatMessageDto> getPinnedMessages(Long groupId) {
        return chatMessageRepository.findByGroupIdAndPinnedTrueAndDeletedFalseOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Edit a message (within 5 minutes).
     */
    @Transactional
    public ChatMessageDto editMessage(Long messageId, String newContent, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSenderId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        if (message.getCreatedAt().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Messages can only be edited within 5 minutes");
        }

        message.setContent(newContent);
        message.setEdited(true);
        message = chatMessageRepository.save(message);

        log.info("[Chat] Message edited: id={}", messageId);
        return toDto(message);
    }

    /**
     * Delete a message (soft delete).
     */
    @Transactional
    public ChatMessageDto deleteMessage(Long messageId, Long userId, boolean isAdmin) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!isAdmin && !message.getSenderId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        message.setDeleted(true);
        message.setContent("This message was deleted");
        message = chatMessageRepository.save(message);

        log.info("[Chat] Message deleted: id={}, by={}, admin={}", messageId, userId, isAdmin);
        return toDto(message);
    }

    /**
     * Pin/unpin a message (admin/mentor only).
     */
    @Transactional
    public ChatMessageDto togglePin(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        message.setPinned(!message.getPinned());
        message = chatMessageRepository.save(message);

        log.info("[Chat] Message pin toggled: id={}, pinned={}", messageId, message.getPinned());
        return toDto(message);
    }

    /**
     * Add reaction to a message.
     */
    @Transactional
    public ChatMessageDto addReaction(Long messageId, String emoji, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        String reactions = message.getReactions();
        String entry = emoji + ":" + userId;
        if (reactions == null || reactions.isEmpty()) {
            reactions = entry;
        } else if (!reactions.contains(entry)) {
            reactions += "," + entry;
        }
        message.setReactions(reactions);
        message = chatMessageRepository.save(message);

        return toDto(message);
    }

    /**
     * Update message delivery/read status.
     */
    @Transactional
    public void updateMessageStatus(Long messageId, Long userId, MessageStatus.Status status) {
        MessageStatus msgStatus = messageStatusRepository.findByMessageIdAndUserId(messageId, userId)
                .orElse(MessageStatus.builder()
                        .messageId(messageId)
                        .userId(userId)
                        .build());

        msgStatus.setStatus(status);
        msgStatus.setUpdatedAt(LocalDateTime.now());
        messageStatusRepository.save(msgStatus);
    }

    /**
     * Convert entity to DTO.
     */
    private ChatMessageDto toDto(ChatMessage message) {
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .groupId(message.getGroupId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .content(message.getContent())
                .type(message.getType())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .replyToId(message.getReplyToId())
                .edited(message.getEdited())
                .deleted(message.getDeleted())
                .pinned(message.getPinned())
                .reactions(message.getReactions())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        // Populate reply reference
        if (message.getReplyToId() != null) {
            chatMessageRepository.findById(message.getReplyToId())
                    .ifPresent(reply -> dto.setReplyTo(ChatMessageDto.builder()
                            .id(reply.getId())
                            .senderId(reply.getSenderId())
                            .senderName(reply.getSenderName())
                            .content(reply.getDeleted() ? "This message was deleted" : reply.getContent())
                            .type(reply.getType())
                            .build()));
        }

        return dto;
    }
}
