package com.chattr.server.config;

import com.chattr.server.utils.RateLimitingFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Central application configuration class. Registers beans like rate-limiting filter and
 * RestTemplate.
 */
@Configuration
public class AppConfig {

  // Rate limiting for authentication endpoints (more restrictive)
  @Value("${rate.limit.auth.requests}")
  private int authRateLimit;

  @Value("${rate.limit.auth.duration}")
  private long authRateDuration;

  // General rate limiting for all endpoints (more permissive)
  @Value("${rate.limit.general.requests}")
  private int generalRateLimit;

  @Value("${rate.limit.general.duration}")
  private long generalRateDuration;

  // Default to prod profile if not specified (so rate limiting is always active)
  @Value("${spring.profiles.active}")
  private String activeProfile;

  /**
   * Rate limiter specifically for authentication endpoints More restrictive to prevent brute force
   * attacks
   */
  @Bean
  public FilterRegistrationBean<RateLimitingFilter> authRateLimitingFilter() {
    FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();

    // Create rate limiter for auth endpoints with stricter limits
    RateLimitingFilter rateLimitingFilter =
        new RateLimitingFilter(authRateLimit, authRateDuration, activeProfile);

    registrationBean.setFilter(rateLimitingFilter);

    // Apply only to authentication endpoints
    registrationBean.addUrlPatterns("/chattr/api/storm/provision/v1.3.2/auth/*");

    registrationBean.setOrder(1); // Execute before JWT filter
    registrationBean.setName("authRateLimitingFilter");

    return registrationBean;
  }

  /**
   * General rate limiter for all other endpoints More permissive to allow normal application usage
   */
  @Bean
  public FilterRegistrationBean<RateLimitingFilter> generalRateLimitingFilter() {
    FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();

    // Create rate limiter for general endpoints with more permissive limits
    RateLimitingFilter rateLimitingFilter =
        new RateLimitingFilter(generalRateLimit, generalRateDuration, activeProfile) {
          @Override
          public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
              throws IOException, ServletException {

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            String requestUri = httpRequest.getRequestURI();

            // Skip general rate limiting for auth endpoints (they have their own stricter limits)
            if (requestUri.contains("/auth/")) {
              chain.doFilter(request, response);
              return;
            }

            // Apply general rate limiting to other endpoints
            super.doFilter(request, response, chain);
          }
        };

    registrationBean.setFilter(rateLimitingFilter);

    // Apply to all endpoints
    registrationBean.addUrlPatterns("/*");

    registrationBean.setOrder(2); // Execute after auth rate limiter
    registrationBean.setName("generalRateLimitingFilter");

    return registrationBean;
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
