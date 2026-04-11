package com.skillsync.chat.websocket;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;

            // Try Authorization header first
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            // Fallback 1: try token header (for SockJS which has header limitations)
            if (token == null) {
                List<String> tokenHeaders = accessor.getNativeHeader("token");
                if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                    token = tokenHeaders.get(0);
                }
            }

            // Fallback 2: try query parameter (for standard WebSockets without header support)
            if (token == null) {
                Object rawQuery = accessor.getHeader("simpConnectMessage");
                if (rawQuery instanceof Message) {
                    StompHeaderAccessor connectAccessor = MessageHeaderAccessor.getAccessor((Message<?>) rawQuery, StompHeaderAccessor.class);
                    if (connectAccessor != null) {
                        // Standard WebSocket upgrade requests can have query params
                        // In STOMP, these are often accessible via native headers if passed properly
                        // But for direct ws://.../ws?token=XYZ, we look at the native headers of the CONNECT frame
                        List<String> queryToken = accessor.getNativeHeader("token");
                        if (queryToken != null && !queryToken.isEmpty()) {
                            token = queryToken.get(0);
                        }
                    }
                }
                
                // Final fallback: Check the URI directly if available
                String uri = (String) accessor.getHeader("simpDestination");
                // Note: Spring hides the raw HTTP request, but many clients send the token 
                // as a 'token' header in the CONNECT frame even if it's in the URL.
            }

            if (token != null) {
                try {
                    Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
                    Claims claims = Jwts.parser()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(token)
                            .getPayload();

                    Long userId = claims.get("userId", Long.class);
                    String email = claims.getSubject();

                    // Store user info in session attributes for use in message handlers
                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes != null) {
                        sessionAttributes.put("userId", userId);
                        sessionAttributes.put("email", email);

                        // Extract name from claims if available
                        String name = claims.get("name", String.class);
                        if (name != null) {
                            sessionAttributes.put("userName", name);
                        }
                    }

                    accessor.setUser(() -> String.valueOf(userId));
                    log.info("[Chat WS] User authenticated: userId={}, email={}", userId, email);
                } catch (Exception e) {
                    log.warn("[Chat WS] JWT validation failed: {}", e.getMessage());
                    // Don't block connection — allow it but without auth context
                    // The message handlers will check for userId
                }
            } else {
                log.warn("[Chat WS] No JWT token provided in CONNECT frame");
            }
        }

        return message;
    }
}
