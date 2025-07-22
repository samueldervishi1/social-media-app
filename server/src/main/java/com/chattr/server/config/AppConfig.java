package com.chattr.server.config;

import com.chattr.server.services.LoggingService;
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
 * Central application configuration class. Registers beans like rate-limiting
 * filter and RestTemplate.
 */
@Configuration
public class AppConfig {

    private final LoggingService loggingService;

    public AppConfig(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> authRateLimitingFilter() {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();

        RateLimitingFilter rateLimitingFilter = new RateLimitingFilter(authRateLimit, authRateDuration, activeProfile,
                loggingService);

        registrationBean.setFilter(rateLimitingFilter);

        registrationBean.addUrlPatterns("/chattr/api/core/v2.2.0/auth/*");

        registrationBean.setOrder(1); // Execute before JWT filter
        registrationBean.setName("authRateLimitingFilter");

        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> generalRateLimitingFilter() {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();

        RateLimitingFilter rateLimitingFilter = new RateLimitingFilter(generalRateLimit, generalRateDuration,
                activeProfile, loggingService) {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                    throws IOException, ServletException {

                HttpServletRequest httpRequest = (HttpServletRequest) request;
                String requestUri = httpRequest.getRequestURI();

                if (requestUri.contains("/auth/")) {
                    chain.doFilter(request, response);
                    return;
                }

                super.doFilter(request, response, chain);
            }
        };

        registrationBean.setFilter(rateLimitingFilter);

        registrationBean.addUrlPatterns("/*");

        registrationBean.setOrder(2);
        registrationBean.setName("generalRateLimitingFilter");

        return registrationBean;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Value("${rate.limit.auth.requests}")
    private int authRateLimit;

    @Value("${rate.limit.auth.duration}")
    private long authRateDuration;

    @Value("${rate.limit.general.requests}")
    private int generalRateLimit;

    @Value("${rate.limit.general.duration}")
    private long generalRateDuration;

    @Value("${spring.profiles.active}")
    private String activeProfile;
}
