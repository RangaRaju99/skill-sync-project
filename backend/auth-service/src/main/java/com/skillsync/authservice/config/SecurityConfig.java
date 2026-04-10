package com.skillsync.authservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.skillsync.authservice.security.CustomUserDetailsService;
import com.skillsync.authservice.security.JwtFilter;
import com.skillsync.authservice.security.InternalServiceFilter;
import com.skillsync.authservice.security.SecurityExceptionHandler;
import com.skillsync.authservice.security.OAuth2SuccessHandler;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;
    private final InternalServiceFilter internalServiceFilter;
    private final SecurityExceptionHandler securityExceptionHandler;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService userDetailsService, 
                         InternalServiceFilter internalServiceFilter, SecurityExceptionHandler securityExceptionHandler,
                         OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.internalServiceFilter = internalServiceFilter;
        this.securityExceptionHandler = securityExceptionHandler;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - use /auth paths (API Gateway strips /api prefix)
                .requestMatchers("/auth/register", "/auth/login", "/auth/refresh",
                        "/auth/send-otp", "/auth/verify-otp",
                        "/auth/forgot-password", "/auth/verify-forgot-password", "/auth/reset-password",
                        "/auth/oauth/google", "/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/internal/**").permitAll()
                .requestMatchers("/auth/internal/**").permitAll()
                // Actuator endpoints for Prometheus scraping
                .requestMatchers("/actuator/**").permitAll()
                // Swagger/OpenAPI endpoints
                .requestMatchers("/v3/api-docs", "/v3/api-docs/**").permitAll()
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-resources", "/swagger-resources/**").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(securityExceptionHandler)
                .accessDeniedHandler(securityExceptionHandler)
            )
            // Add InternalServiceFilter BEFORE JwtFilter to check for internal service calls first
            .addFilterBefore(internalServiceFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
