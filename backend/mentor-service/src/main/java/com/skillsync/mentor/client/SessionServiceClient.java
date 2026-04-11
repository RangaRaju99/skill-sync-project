package com.skillsync.mentor.client;

import com.skillsync.mentor.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "session-service", url = "${app.services.session-service.url:http://localhost:8088}")
public interface SessionServiceClient {

    @GetMapping("/session/mentor/{mentorId}/count")
    ApiResponse<Long> getMentorSessionCount(@PathVariable("mentorId") Long mentorId);
}
