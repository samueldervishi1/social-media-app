package com.chattr.server.utils;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servlet filter to apply rate limiting on incoming requests using Bucket4j.
 * The filter identifies users by their IP address and restricts them to a configurable
 * number of requests per time window.
 */
@Slf4j
public class RateLimitingFilter implements Filter {

    private final int defaultLimit;
    private final long defaultDurationMinutes;
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();
    private final String activeProfile;

    public RateLimitingFilter(int defaultLimit, long defaultDurationMinutes, String activeProfile) {
        this.defaultLimit = defaultLimit;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.activeProfile = activeProfile;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("RateLimitingFilter initialized: {} requests / {} minute(s)", defaultLimit, defaultDurationMinutes);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if ("dev".equalsIgnoreCase(activeProfile)) {
            chain.doFilter(request, response); // No rate limiting in dev
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientKey = getClientIdentifier(httpRequest);
        Bucket bucket = userBuckets.computeIfAbsent(clientKey, key -> createRateLimitBucket());

        if (bucket.tryConsume(1)) {
            // Request is allowed, continue processing
            chain.doFilter(request, response);
        } else {
            // Request exceeds rate limit
            log.warn("Rate limit exceeded for client: {}", clientKey);
            sendRateLimitResponse(httpResponse);
        }
    }

    @Override
    public void destroy() {
        log.info("RateLimitingFilter destroyed. Clearing tracked buckets.");
        userBuckets.clear();
    }

    private String getClientIdentifier(HttpServletRequest request) {
        return request.getRemoteAddr(); // TODO: Replace with user ID or token if authentication is available
    }

    private Bucket createRateLimitBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(defaultLimit)
                        .refillIntervally(defaultLimit, Duration.ofMinutes(defaultDurationMinutes))
                        .build())
                .build();
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{ \"status\": 429, \"message\": \"Too many requests. Please slow down.\" }");
        response.getWriter().flush();
    }
}