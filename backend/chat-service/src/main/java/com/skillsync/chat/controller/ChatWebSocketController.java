package com.skillsync.chat.controller;

import com.skillsync.chat.dto.*;
import com.skillsync.chat.entity.ChatMessage;
import com.skillsync.chat.entity.MessageStatus;
import com.skillsync.chat.service.ChatMessageService;
import com.skillsync.chat.service.RedisChatSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisChatSyncService redisChatSyncService;

    /**
     * Handle incoming chat messages from WebSocket.
     * Client sends to: /app/chat.send
     * Broadcasts via Redis Sync to all instances.
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        String userName = getUserName(headerAccessor);

        ChatMessageDto savedMessage = chatMessageService.sendMessage(request, userId, userName);

        // Sync via Redis to reach all instances
        redisChatSyncService.sendSyncMessage(
                "/topic/group/" + request.getGroupId(),
                savedMessage);

        log.debug("[Chat WS] Message sent to Redis Sync for group {}", request.getGroupId());
    }

    /**
     * Handle typing indicators.
     * Client sends to: /app/chat.typing
     * Broadcasts to: /topic/group/{groupId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingEvent event,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        String userName = getUserName(headerAccessor);

        event.setUserId(userId);
        event.setUserName(userName);

        redisChatSyncService.sendSyncMessage(
                "/topic/group/" + event.getGroupId() + "/typing",
                event);
    }

    /**
     * Handle message status updates (delivered/read).
     * Client sends to: /app/chat.status
     * Broadcasts to: /topic/group/{groupId}/status
     */
    @MessageMapping("/chat.status")
    public void updateStatus(@Payload MessageStatusUpdate update,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        update.setUserId(userId);

        chatMessageService.updateMessageStatus(
                update.getMessageId(),
                userId,
                MessageStatus.Status.valueOf(update.getStatus()));

        // Notify via Redis Sync
        redisChatSyncService.sendSyncMessage(
                "/topic/message/" + update.getMessageId() + "/status",
                update);
    }

    /**
     * Handle message edit.
     * Client sends to: /app/chat.edit
     */
    @MessageMapping("/chat.edit")
    public void editMessage(@Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        String newContent = payload.get("content").toString();

        try {
            ChatMessageDto edited = chatMessageService.editMessage(messageId, newContent, userId);
            Long groupId = edited.getGroupId();

            redisChatSyncService.sendSyncMessage(
                    "/topic/group/" + groupId + "/edit",
                    edited);
        } catch (Exception e) {
            log.warn("[Chat WS] Edit failed: {}", e.getMessage());
        }
    }

    /**
     * Handle message deletion.
     * Client sends to: /app/chat.delete
     */
    @MessageMapping("/chat.delete")
    public void deleteMessage(@Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        boolean isAdmin = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("isAdmin", "false")));

        try {
            ChatMessageDto deleted = chatMessageService.deleteMessage(messageId, userId, isAdmin);
            Long groupId = deleted.getGroupId();

            redisChatSyncService.sendSyncMessage(
                    "/topic/group/" + groupId + "/delete",
                    deleted);
        } catch (Exception e) {
            log.warn("[Chat WS] Delete failed: {}", e.getMessage());
        }
    }

    /**
     * Handle reactions.
     * Client sends to: /app/chat.react
     */
    @MessageMapping("/chat.react")
    public void addReaction(@Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getUserId(headerAccessor);
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        String emoji = payload.get("emoji").toString();

        ChatMessageDto updated = chatMessageService.addReaction(messageId, emoji, userId);

        redisChatSyncService.sendSyncMessage(
                "/topic/group/" + updated.getGroupId() + "/reaction",
                updated);
    }

    // ─── Helpers ─────────────────────────────────────────────

    private Long getUserId(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            return (Long) sessionAttributes.get("userId");
        }
        // Fallback: try from user principal
        if (headerAccessor.getUser() != null) {
            try {
                return Long.valueOf(headerAccessor.getUser().getName());
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        return 0L;
    }

    private String getUserName(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("userName")) {
            return (String) sessionAttributes.get("userName");
        }
        if (sessionAttributes != null && sessionAttributes.containsKey("email")) {
            return (String) sessionAttributes.get("email");
        }
        return "Unknown";
    }
}
