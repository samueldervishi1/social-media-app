package com.server.server.utils;

import com.server.server.exceptions.CustomException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class RateLimitingFilter implements Filter {

	private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

	@Value("${rate.limit.requests:5}")
	private int defaultLimit;

	@Value("${rate.limit.duration:1}")
	private long defaultDurationMinutes;

	@Value("${rate.limit.url:/tmf/server/api/v2.2.10/quantum-query}")
	private String rateLimitedUrl;

	@Override
	public void init(FilterConfig filterConfig) {
		log.info("RateLimitingFilter initialized with configuration: " +
						"limit={}, duration={} minutes, URL={}",
				defaultLimit, defaultDurationMinutes, rateLimitedUrl);
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		String requestUrl = httpRequest.getRequestURI();

		if (isRateLimitedUrl(requestUrl)) {
			String userIdentifier = getUserIdentifier(httpRequest);
			Bucket bucket = getBucketForUrl(requestUrl, userIdentifier);

			if (bucket.tryConsume(1)) {
				chain.doFilter(request, response);
			} else {
				log.warn("Rate limit exceeded for user: {}, URL: {}", userIdentifier, requestUrl);
				throw new CustomException("Too many requests. Please wait and try again.");
			}
		} else {
			chain.doFilter(request, response);
		}
	}

	@Override
	public void destroy() {
		log.info("RateLimitingFilter destroyed.");
		buckets.clear();
	}

	/**
	 * Determines if the URL is subject to rate limiting.
	 */
	private boolean isRateLimitedUrl(String requestUrl) {
		return requestUrl != null && requestUrl.startsWith(rateLimitedUrl);
	}

	/**
	 * Extracts a unique identifier for the user.
	 * Can be extended to use more sophisticated identification methods.
	 */
	private String getUserIdentifier(HttpServletRequest request) {
		return request.getRemoteAddr();
	}

	/**
	 * Retrieves or creates a bucket for a specific user and URL.
	 */
	private Bucket getBucketForUrl(String url, String userIdentifier) {
		return buckets.computeIfAbsent(
				generateBucketKey(url, userIdentifier),
				key -> createDefaultBucket()
		);
	}

	/**
	 * Generates a unique key for the bucket.
	 */
	private String generateBucketKey(String url, String userIdentifier) {
		return userIdentifier + ":" + url;
	}

	/**
	 * Creates a default bucket using a fixed refill interval.
	 */
	private Bucket createDefaultBucket() {
		Duration duration = Duration.ofMinutes(defaultDurationMinutes);

		return Bucket.builder()
				.addLimit(
						Bandwidth.builder()
								.capacity(defaultLimit)
								.refillIntervally(defaultLimit, duration)
								.build()
				)
				.build();
	}
}