package com.skillsync.mentor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "user-service", url = "${user-service.url:http://user-service:8081}", path = "/api/user")
public interface UserServiceClient {

    @GetMapping("/internal/users/{userId}")
    ResponseEntity<Map<String, Object>> getUserById(@PathVariable("userId") Long userId);
}
