package com.skillsync.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @PostMapping("/user/internal/users")
    void createProfile(@RequestBody Map<String, Object> userData);

    @PostMapping("/user/internal/users/{userId}/activity")
    void updateUserActivity(@PathVariable("userId") Long userId);
}