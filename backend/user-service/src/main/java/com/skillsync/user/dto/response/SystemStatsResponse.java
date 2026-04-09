package com.skillsync.user.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class SystemStatsResponse {
    private long totalInhabitants;
    private long activeUsers;
    private long pendingMentors;
    private long totalSkills;
    private Map<String, Long> userDistribution; // Role -> Count
    private Map<String, Long> statusDistribution; // Status -> Count
}
