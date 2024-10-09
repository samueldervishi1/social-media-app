package org.server.socialapp.config;

import org.server.socialapp.util.RateLimitingFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilter() {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new RateLimitingFilter());
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }
}
