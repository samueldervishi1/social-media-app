package com.chattr.server.utils;

import com.chattr.server.services.LoggingService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import lombok.extern.slf4j.Slf4j;

/**
 * Servlet filter to apply rate limiting on incoming requests using Bucket4j.
 * The filter identifies users by their IP address and restricts them to a
 * configurable number of requests per time window.
 */
@Slf4j
public class RateLimitingFilter implements Filter {

    private final int defaultLimit;
    private final long defaultDurationMinutes;
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();
    private final String activeProfile;
    private final LoggingService loggingService;

    public RateLimitingFilter(int defaultLimit, long defaultDurationMinutes, String activeProfile,
            LoggingService loggingService) {
        this.defaultLimit = defaultLimit;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.activeProfile = activeProfile;
        this.loggingService = loggingService;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("RateLimitingFilter initialized: {} requests / {} minute(s)", defaultLimit, defaultDurationMinutes);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if ("dev".equalsIgnoreCase(activeProfile)) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String requestUri = httpRequest.getRequestURI();

            if (shouldApplyRateLimit(requestUri)) {
                String clientKey = getClientIdentifier(httpRequest);
                Bucket bucket = userBuckets.computeIfAbsent(clientKey, key -> createRateLimitBucket());

                if (bucket.tryConsume(1)) {
                    chain.doFilter(request, response);
                } else {
                    log.warn("Rate limit exceeded for client: {} on endpoint: {}", clientKey, requestUri);
                    sendRateLimitResponse(httpResponse);
                }
            } else {
                chain.doFilter(request, response);
            }

        } catch (Exception e) {
            loggingService.logError("Rate Limit Filter", "doFilter", "Something went wrong while applying rate limit",
                    e);
            log.error("Error in rate limiting filter", e);
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {
        log.info("RateLimitingFilter destroyed. Clearing tracked buckets.");
        userBuckets.clear();
    }

    private boolean shouldApplyRateLimit(String requestUri) {
        return requestUri != null;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private Bucket createRateLimitBucket() {
        try {
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(defaultLimit)
                            .refillIntervally(defaultLimit, Duration.ofMinutes(defaultDurationMinutes)).build())
                    .build();
        } catch (Exception e) {
            loggingService.logError("Rate Limit Filter", "createRateLimitBucket",
                    "Something went wrong while creating rate limit bucket", e);
            log.error("Failed to create rate limit bucket", e);
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(1000).refillIntervally(1000, Duration.ofMinutes(1)).build())
                    .build();
        }
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        try {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = "{ \"status\": 429, \"message\": \"Too many requests. Please slow down.\" }";
            response.getWriter().write(jsonResponse);
            response.getWriter().flush();

        } catch (Exception e) {
            loggingService.logError("Rate Limit Filter", "sendRateLimitResponse",
                    "Something went wrong while sending limit response", e);
            log.error("Failed to send rate limit response", e);
            response.setStatus(429);
        }
    }
}
