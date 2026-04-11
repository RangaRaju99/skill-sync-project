package com.skillsync.chat.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MessageStatusUpdate {
    private Long messageId;
    private Long userId;
    private String status;
}
