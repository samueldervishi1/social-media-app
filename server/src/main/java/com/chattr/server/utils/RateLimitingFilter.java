package com.chattr.server.utils;

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
 * Servlet filter to apply rate limiting on incoming requests using Bucket4j. The filter identifies
 * users by their IP address and restricts them to a configurable number of requests per time
 * window.
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
    log.info(
        "RateLimitingFilter initialized: {} requests / {} minute(s)",
        defaultLimit,
        defaultDurationMinutes);
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    // Skip rate limiting in dev profile
    if ("dev".equalsIgnoreCase(activeProfile)) {
      chain.doFilter(request, response);
      return;
    }

    try {
      String requestUri = httpRequest.getRequestURI();

      // Only apply rate limiting to sensitive endpoints (auth endpoints)
      if (shouldApplyRateLimit(requestUri)) {
        String clientKey = getClientIdentifier(httpRequest);
        Bucket bucket = userBuckets.computeIfAbsent(clientKey, key -> createRateLimitBucket());

        if (bucket.tryConsume(1)) {
          // Request is allowed, continue processing
          chain.doFilter(request, response);
        } else {
          // Request exceeds rate limit
          log.warn("Rate limit exceeded for client: {} on endpoint: {}", clientKey, requestUri);
          sendRateLimitResponse(httpResponse);
        }
      } else {
        // No rate limiting for other endpoints
        chain.doFilter(request, response);
      }

    } catch (Exception e) {
      // Don't let rate limiting errors break the application
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
    // Apply rate limiting to all endpoints (this will be controlled by filter registration
    // patterns)
    return requestUri != null;
  }

  private String getClientIdentifier(HttpServletRequest request) {
    // Try to get IP from X-Forwarded-For header first (for proxy scenarios)
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }

    // Try X-Real-IP header
    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isEmpty()) {
      return xRealIp;
    }

    // Fall back to remote address
    return request.getRemoteAddr();
  }

  private Bucket createRateLimitBucket() {
    try {
      return Bucket.builder()
          .addLimit(
              Bandwidth.builder()
                  .capacity(defaultLimit)
                  .refillIntervally(defaultLimit, Duration.ofMinutes(defaultDurationMinutes))
                  .build())
          .build();
    } catch (Exception e) {
      log.error("Failed to create rate limit bucket", e);
      // Return a permissive bucket if creation fails
      return Bucket.builder()
          .addLimit(
              Bandwidth.builder()
                  .capacity(1000)
                  .refillIntervally(1000, Duration.ofMinutes(1))
                  .build())
          .build();
    }
  }

  private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
    try {
      response.setStatus(429);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");

      String jsonResponse =
          "{ \"status\": 429, \"message\": \"Too many requests. Please slow down.\" }";
      response.getWriter().write(jsonResponse);
      response.getWriter().flush();

    } catch (Exception e) {
      log.error("Failed to send rate limit response", e);
      // Fallback to simple response
      response.setStatus(429);
    }
  }
}
