package com.skillsync.chat.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TypingEvent {
    private Long groupId;
    private Long userId;
    private String userName;
    private boolean typing;
}
