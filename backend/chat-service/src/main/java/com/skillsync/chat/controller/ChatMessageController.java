package com.skillsync.chat.controller;

import com.skillsync.chat.dto.ChatMessageDto;
import com.skillsync.chat.entity.ChatMessage;
import com.skillsync.chat.service.AzureBlobService;
import com.skillsync.chat.service.ChatMessageService;
import com.skillsync.chat.service.RedisChatSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat", description = "Chat message REST endpoints")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final AzureBlobService azureBlobService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisChatSyncService redisChatSyncService;

    /**
     * GET /chat/test
     * Simple health check for gateway routing validation.
     */
    @GetMapping("/test")
    @Operation(summary = "Test connectivity", description = "Verify gateway to service routing")
    public String test() {
        return "Chat Service is UP and Reachable via Gateway!";
    }

    /**
     * GET /chat/messages/{groupId}?page=0&size=20
     * Fetch paginated messages for a group (lazy loading).
     */
    @GetMapping("/messages/{groupId}")
    @Operation(summary = "Get messages for a group", description = "Paginated messages, newest first")
    public ResponseEntity<Page<ChatMessageDto>> getMessages(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(chatMessageService.getMessages(groupId, page, size));
    }

    /**
     * GET /chat/messages/{groupId}/pinned
     * Get pinned messages for a group.
     */
    @GetMapping("/messages/{groupId}/pinned")
    @Operation(summary = "Get pinned messages for a group")
    public ResponseEntity<List<ChatMessageDto>> getPinnedMessages(@PathVariable Long groupId) {
        return ResponseEntity.ok(chatMessageService.getPinnedMessages(groupId));
    }

    /**
     * POST /chat/upload
     * Upload a file (image/video/document) to Azure Blob Storage.
     * Returns the saved message with secure SAS URL.
     */
    @PostMapping("/upload")
    @Operation(summary = "Upload file to chat", description = "Images (5MB), Videos (50MB), Docs (10MB)")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("groupId") Long groupId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "loggedInUser", required = false) String email) {
        try {
            Long senderId = userIdHeader != null ? Long.valueOf(userIdHeader) : 0L;
            String senderName = email != null ? email : "Unknown";
            String messageId = UUID.randomUUID().toString();

            // Upload to Azure Blob and get SAS URL
            String fileUrl = azureBlobService.uploadFile(file, groupId, messageId);

            // Determine message type from content type
            ChatMessage.MessageType type = determineType(file.getContentType());

            // Save file message to DB
            ChatMessageDto savedMessage = chatMessageService.sendFileMessage(
                    groupId, senderId, senderName,
                    fileUrl, file.getOriginalFilename(), file.getSize(), type);

            // Broadcast via Redis Sync
            redisChatSyncService.sendSyncMessage("/topic/group/" + groupId, savedMessage);

            return ResponseEntity.ok(savedMessage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("[Chat] File upload failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed"));
        }
    }

    /**
     * PUT /chat/messages/{messageId}/pin
     * Toggle pin on a message (admin/mentor action).
     */
    @PutMapping("/messages/{messageId}/pin")
    @Operation(summary = "Pin/unpin a message")
    public ResponseEntity<ChatMessageDto> togglePin(@PathVariable Long messageId) {
        return ResponseEntity.ok(chatMessageService.togglePin(messageId));
    }

    /**
     * DELETE /chat/messages/{messageId}
     * Delete a message (admin action).
     */
    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Delete a message (admin)")
    public ResponseEntity<ChatMessageDto> deleteMessage(
            @PathVariable Long messageId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = userIdHeader != null ? Long.valueOf(userIdHeader) : 0L;
        return ResponseEntity.ok(chatMessageService.deleteMessage(messageId, userId, true));
    }

    private ChatMessage.MessageType determineType(String contentType) {
        if (contentType == null) return ChatMessage.MessageType.DOCUMENT;
        if (contentType.startsWith("image/")) return ChatMessage.MessageType.IMAGE;
        if (contentType.startsWith("video/")) return ChatMessage.MessageType.VIDEO;
        return ChatMessage.MessageType.DOCUMENT;
    }
}
