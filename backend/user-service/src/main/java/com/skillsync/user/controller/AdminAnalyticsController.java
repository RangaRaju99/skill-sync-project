package com.skillsync.user.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsync.user.repository.UserProfileRepository;

@RestController
@RequestMapping("/user/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getRolesDistribution() {
        return ResponseEntity.ok(userProfileRepository.countUsersByRole());
    }

    @GetMapping("/user-status")
    public ResponseEntity<List<Map<String, Object>>> getStatusDistribution() {
        return ResponseEntity.ok(userProfileRepository.countUsersByStatus());
    }

    @GetMapping("/users-growth")
    public ResponseEntity<List<Map<String, Object>>> getUsersGrowth() {
        return ResponseEntity.ok(userProfileRepository.getUserGrowthMetrics());
    }
}
