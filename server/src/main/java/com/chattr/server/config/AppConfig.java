package com.chattr.server.config;

import com.chattr.server.utils.RateLimitingFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${rate.limit.requests:100}")
    private int rateLimit;

    @Value("${rate.limit.duration:1}")
    private long rateDuration;

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilter() {
        RateLimitingFilter rateLimitingFilter = new RateLimitingFilter(rateLimit, rateDuration);

        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(rateLimitingFilter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}