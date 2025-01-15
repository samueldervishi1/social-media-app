package com.chirp.server.configs;

import com.chirp.server.utils.RateLimitingFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

	private static final String API_URL_PATTERN = "/api/*";

	@Bean
	public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilter() {
		return new FilterRegistrationBean<>() {{
			setFilter(new RateLimitingFilter());
			addUrlPatterns(API_URL_PATTERN);
		}};
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}