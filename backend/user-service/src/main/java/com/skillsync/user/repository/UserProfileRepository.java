package com.skillsync.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillsync.user.entity.UserProfile;

/**
 * UserProfile Repository
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

	Optional<UserProfile> findByUserId(Long userId);

	Optional<UserProfile> findByEmail(String email);

	@org.springframework.data.jpa.repository.Query("SELECT u.role AS name, COUNT(u) AS value FROM UserProfile u GROUP BY u.role")
	java.util.List<java.util.Map<String, Object>> countUsersByRole();

	@org.springframework.data.jpa.repository.Query("SELECT u.status AS name, COUNT(u) AS value FROM UserProfile u GROUP BY u.status")
	java.util.List<java.util.Map<String, Object>> countUsersByStatus();

	// Basic daily growth projection using MySQL syntax for date
	@org.springframework.data.jpa.repository.Query(
		value = "SELECT DATE_FORMAT(created_at, '%b %d') AS date, COUNT(*) AS users, " +
		        "SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active " +
		        "FROM user_profiles GROUP BY DATE_FORMAT(created_at, '%b %d') ORDER BY MIN(created_at) DESC LIMIT 30", 
		nativeQuery = true)
	java.util.List<java.util.Map<String, Object>> getUserGrowthMetrics();
}
