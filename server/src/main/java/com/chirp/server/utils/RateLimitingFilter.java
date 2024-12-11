package com.chirp.server.utils;

import com.chirp.server.exceptions.TooManyRequestsException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitingFilter implements Filter {

	private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

	private static final int DEFAULT_LIMIT = 5;
	private static final Duration DEFAULT_DURATION = Duration.ofMinutes(1);
	private static final Duration RETRY_AFTER_DURATION = Duration.ofSeconds(30);

	private static final String RATE_LIMITED_URL = "/api/v2/ask";

	@Override
	public void init(FilterConfig filterConfig) {
		System.out.println("RateLimitingFilter initialized.");
	}

	@Override
	public void doFilter(ServletRequest request , ServletResponse response , FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		String requestUrl = httpRequest.getRequestURI();

		if (requestUrl.startsWith(RATE_LIMITED_URL)) {
			String userIdentifier = httpRequest.getRemoteAddr();
			Bucket bucket = getBucketForUrl(requestUrl , userIdentifier);

			if (bucket.tryConsume(1)) {
				chain.doFilter(request , response);
			} else {
				throw new TooManyRequestsException("Too many requests. Please wait and try again." , RETRY_AFTER_DURATION.getSeconds());
			}
		} else {
			chain.doFilter(request , response);
		}
	}

	@Override
	public void destroy() {
		System.out.println("RateLimitingFilter destroyed.");
	}

	private Bucket getBucketForUrl(String url , String userIdentifier) {
		return buckets.computeIfAbsent(userIdentifier + ":" + url , this::createBucketForUrl);
	}

	private Bucket createBucketForUrl(String url) {
		return createDefaultBucket(DEFAULT_LIMIT , DEFAULT_DURATION);
	}

	private Bucket createDefaultBucket(int limit , Duration duration) {
		Refill refill = Refill.intervally(limit , duration);
		Bandwidth bandwidth = Bandwidth.classic(limit , refill);
		return Bucket.builder().addLimit(bandwidth).build();
	}
}