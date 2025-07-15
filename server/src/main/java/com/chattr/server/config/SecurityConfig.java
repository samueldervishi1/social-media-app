package com.chattr.server.config;

import com.chattr.server.utils.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration for the application. Configures CORS, JWT authentication filter,
 * public/private routes, and password encoding.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Value("${cors.allowed-origins}")
  private String allowedOrigins;

  @Value("${security.public-urls}")
  private String[] publicUrls;

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfig()))
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(publicUrls)
                    .permitAll() // Publicly accessible endpoints
                    .requestMatchers("/tmf/server/api/223_v2/**")
                    .authenticated() // Protected API path
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll() // Allow pre-flight requests
                    .anyRequest()
                    .permitAll() // Allow all other requests (adjust as needed)
            )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .logout(AbstractHttpConfigurer::disable)
        .exceptionHandling(
            exception ->
                exception.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                      response.setContentType("text/plain");
                      response.getWriter().write("Unauthorized Access");
                    }));

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
