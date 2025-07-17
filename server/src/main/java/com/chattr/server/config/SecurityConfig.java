package com.chattr.server.config;

import com.chattr.server.utils.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration for the application. Configures CORS, JWT
 * authentication filter, public/private routes, and password encoding.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("CONFIGURING SECURITY FILTER CHAIN");

        http.cors(cors -> cors.configurationSource(corsConfig()))
                // CSRF Protection Disabled - Safe for Stateless JWT API
                // Rationale:
                // 1. SessionCreationPolicy.STATELESS - No server-side sessions created or used
                // 2. JWT tokens manually extracted/validated per request - No automatic browser
                // auth
                // 3. No server state to exploit - Each request is independent and
                // self-contained
                // 4. Custom authentication flow prevents traditional CSRF attack vectors
                // CodeQL suppression: lgtm[java/spring-disabled-csrf-protection]
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfig() {
        return request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setExposedHeaders(List.of("Authorization", "Content-Type"));
            config.setAllowCredentials(true);
            return config;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(8);
    }
}
