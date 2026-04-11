package com.skillsync.chat.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessageRequest {
    private Long groupId;
    private String content;
    private String type;
    private Long replyToId;
}
