package com.chattr.server.utils;

import com.chattr.server.exceptions.CustomException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class RateLimitingFilter implements Filter {

    private final int defaultLimit;
    private final long defaultDurationMinutes;
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(int defaultLimit, long defaultDurationMinutes) {
        this.defaultLimit = defaultLimit;
        this.defaultDurationMinutes = defaultDurationMinutes;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("RateLimitingFilter initialized. Global limit: {} requests per {} minute(s)", defaultLimit, defaultDurationMinutes);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String userIdentifier = getUserIdentifier(httpRequest);
        Bucket bucket = getOrCreateBucket(userIdentifier);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {}", userIdentifier);

            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{ \"status\": 429, \"message\": \"Too many requests. Please slow down.\" }");
            httpResponse.getWriter().flush();
        }
    }

    @Override
    public void destroy() {
        log.info("RateLimitingFilter destroyed.");
        userBuckets.clear();
    }

    /**
     * Extracts a unique identifier for the user.
     * Can be extended to use more sophisticated identification methods.
     */
    private String getUserIdentifier(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private Bucket getOrCreateBucket(String userIdentifier) {
        return userBuckets.computeIfAbsent(userIdentifier, key -> createDefaultBucket());
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