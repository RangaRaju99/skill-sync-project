package com.skillsync.user.audit;

import com.skillsync.user.entity.AuditLog;
import com.skillsync.user.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String entityName, Long entityId, String action, String performedBy, String details) {
        try {
            AuditLog entry = AuditLog.builder()
                    .action(action)
                    .performerEmail(performedBy != null ? performedBy : "system")
                    .targetId(entityId)
                    .targetType(entityName)
                    .description(details)
                    .build();
            auditLogRepository.save(entry);
            log.debug("[AUDIT] {} {} id={} by={}", action, entityName, entityId, performedBy);
        } catch (Exception e) {
            log.warn("[AUDIT] Failed to save audit log: {}", e.getMessage());
        }
    }
}
