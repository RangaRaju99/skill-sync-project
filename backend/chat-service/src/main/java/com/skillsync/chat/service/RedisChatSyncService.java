package com.skillsync.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsync.chat.config.RedisSyncConfig;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service to handle Redis Pub/Sub publishing and subscription for cross-instance sync.
 */
@Service
@Slf4j
public class RedisChatSyncService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RedisChatSyncService(RedisTemplate<String, Object> redisTemplate,
                               SimpMessagingTemplate messagingTemplate,
                               ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Publish a message to Redis channel for all service instances to receive.
     */
    public void sendSyncMessage(String destination, Object payload) {
        try {
            SyncMessage syncMessage = new SyncMessage(destination, payload);
            String json = objectMapper.writeValueAsString(syncMessage);
            redisTemplate.convertAndSend(RedisSyncConfig.CHAT_CHANNEL, json);
            log.debug("[Redis Sync] Sent message to destination: {}", destination);
        } catch (Exception e) {
            log.error("[Redis Sync] Failed to publish message", e);
        }
    }

    /**
     * Called when a message is received from Redis channel.
     * Broadcasts the message to locally connected WebSocket clients.
     */
    public void handleSyncMessage(String message) {
        try {
            SyncMessage syncMessage = objectMapper.readValue(message, SyncMessage.class);
            messagingTemplate.convertAndSend(syncMessage.getDestination(), syncMessage.getPayload());
            log.debug("[Redis Sync] Received and forwarded message to: {}", syncMessage.getDestination());
        } catch (Exception e) {
            log.error("[Redis Sync] Failed to process sync message", e);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SyncMessage {
        private String destination;
        private Object payload;
    }
}
