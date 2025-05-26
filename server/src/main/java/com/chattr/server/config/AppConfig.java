package com.chattr.server.config;

import com.chattr.server.utils.RateLimitingFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Central application configuration class.
 * Registers beans like rate-limiting filter and RestTemplate.
 */
@Configuration
public class AppConfig {

    @Value("${rate.limit.requests:100}")
    private int rateLimit;

    @Value("${rate.limit.duration:1}")
    private long rateDuration;

    @Value("${spring.profiles.active}")
    private String activeProfile;


    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilter() {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new RateLimitingFilter(rateLimit, rateDuration, activeProfile));
        registrationBean.addUrlPatterns("/*"); // Apply to all endpoints
        registrationBean.setOrder(1);          // Set filter execution order (low value = higher priority)
        return registrationBean;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}