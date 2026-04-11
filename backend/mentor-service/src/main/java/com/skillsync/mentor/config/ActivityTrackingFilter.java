package com.skillsync.mentor.config;

import com.skillsync.mentor.entity.MentorProfile;
import com.skillsync.mentor.repository.MentorRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * ActivityTrackingFilter
 * Automatically updates 'lastActive' timestamp for the mentor on every operational request.
 */
@Component
public class ActivityTrackingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(ActivityTrackingFilter.class);

    @Autowired
    private MentorRepository mentorRepository;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String userIdHeader = httpRequest.getHeader("X-User-Id");

        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                Long userId = Long.parseLong(userIdHeader);
                updateLastActive(userId);
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header: {}", userIdHeader);
            }
        }

        chain.doFilter(request, response);
    }

    private void updateLastActive(Long userId) {
        mentorRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setLastActive(LocalDateTime.now());
            mentorRepository.save(profile);
            log.debug("Updated lastActive for Mentor userId: {}", userId);
        });
    }
}
