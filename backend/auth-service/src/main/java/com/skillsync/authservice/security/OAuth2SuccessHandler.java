package com.skillsync.authservice.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.Arrays;

import com.skillsync.authservice.entity.User;
import com.skillsync.authservice.enums.AuthProvider;
import com.skillsync.authservice.service.OAuthService;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final OAuthService oAuthService;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, OAuthService oAuthService) {
        this.jwtUtil = jwtUtil;
        this.oAuthService = oAuthService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String sub = (String) attributes.get("sub"); // Google unique ID

        // Sync user with DB
        User user = oAuthService.processOAuthUser(email, name, sub, AuthProvider.GOOGLE);

        // Generate real JWT Token with User ID
        List<String> roles = Arrays.asList(user.getRole().split(","));
        String jwtToken = jwtUtil.generateToken(user.getId(), user.getEmail(), roles);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/auth/success")
                .queryParam("token", jwtToken)
                .build().toUriString();

        if (response.isCommitted()) {
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
