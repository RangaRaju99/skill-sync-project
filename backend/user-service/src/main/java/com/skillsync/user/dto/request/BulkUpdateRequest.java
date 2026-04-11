package com.skillsync.user.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class BulkUpdateRequest {
    private List<Long> userIds;
    private String field; // "ROLE", "STATUS"
    private String value;
    private String reason;
}
