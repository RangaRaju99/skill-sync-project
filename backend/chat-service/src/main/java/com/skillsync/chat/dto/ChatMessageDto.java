package com.skillsync.chat.dto;

import com.skillsync.chat.entity.ChatMessage;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String content;
    private ChatMessage.MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Long replyToId;
    private ChatMessageDto replyTo;
    private Boolean edited;
    private Boolean deleted;
    private Boolean pinned;
    private String reactions;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
