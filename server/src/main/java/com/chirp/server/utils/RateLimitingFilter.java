package com.chirp.server.utils;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class RateLimitingFilter implements Filter {

	private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

	@Override
	public void doFilter(ServletRequest request , ServletResponse response , FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		String requestUrl = httpRequest.getRequestURI();

		Bucket bucket = getBucketForUrl(requestUrl);

		if (bucket.tryConsume(1)) {
			chain.doFilter(request , response);
		} else {
			HttpServletResponse httpResponse = (HttpServletResponse) response;
			httpResponse.setStatus(HttpServletResponse.SC_REQUEST_TIMEOUT);
			httpResponse.getWriter().write("Too many requests");
		}
	}

	@Override
	public void destroy() {
	}

	private Bucket getBucketForUrl(String url) {
		if (url.equals("/api/ask")) {
			return buckets.computeIfAbsent(url , this::createLimitedBucket);
		} else {
			return buckets.computeIfAbsent(url , this::createDefaultBucket);
		}
	}

	private Bucket createDefaultBucket(String key) {
		Refill refill = Refill.intervally(20 , Duration.ofMinutes(1));
		Bandwidth limit = Bandwidth.classic(20 , refill);
		return Bucket.builder().addLimit(limit).build();
	}

	private Bucket createLimitedBucket(String key) {
		Refill refill = Refill.intervally(2 , Duration.ofMinutes(2));
		Bandwidth limit = Bandwidth.classic(2 , refill);
		return Bucket.builder().addLimit(limit).build();
	}
}