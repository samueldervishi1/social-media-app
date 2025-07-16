package com.chattr.server.utils;

import com.mongodb.lang.NonNull;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException; // Updated import
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT authentication filter for processing incoming requests and verifying authentication tokens
 * stored in cookies.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String TOKEN_COOKIE_NAME = "token";
  private final AntPathMatcher pathMatcher = new AntPathMatcher();
  private final JwtTokenUtil jwtTokenUtil;

  @Autowired
  public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
    this.jwtTokenUtil = jwtTokenUtil;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    String uri = request.getRequestURI();
    String method = request.getMethod();

    System.out.println("=== JWT FILTER: " + method + " " + uri + " ===");

    setSecurityHeaders(response);

    // Skip authentication for public endpoints
    if (isPublicEndpoint(uri)) {
      System.out.println("✅ PUBLIC ENDPOINT - Skipping auth");
      filterChain.doFilter(request, response);
      return;
    }

    System.out.println("🔒 PRIVATE ENDPOINT - Checking auth");

    try {
      // Extract token from cookies
      String token = extractTokenFromCookies(request);

      if (token == null || token.trim().isEmpty()) {
        System.out.println("❌ NO TOKEN - Sending 401");
        sendErrorResponse(response, "Authentication required");
        return;
      }

      // Validate token format before parsing
      if (!isValidTokenFormat(token)) {
        System.out.println("❌ INVALID FORMAT - Sending 401");
        sendErrorResponse(response, "Invalid token format");
        return;
      }

      // Parse and validate token safely
      Claims claims = parseTokenSafely(token);
      if (claims == null) {
        System.out.println("❌ TOKEN PARSE FAILED - Sending 401");
        sendErrorResponse(response, "Invalid or expired token");
        return;
      }

      String username = claims.getSubject();
      if (username == null || username.trim().isEmpty()) {
        System.out.println("❌ NO USERNAME - Sending 401");
        sendErrorResponse(response, "Invalid token content");
        return;
      }

      // Set authentication in security context
      UsernamePasswordAuthenticationToken auth =
          new UsernamePasswordAuthenticationToken(username, null, null);
      SecurityContextHolder.getContext().setAuthentication(auth);

      System.out.println("✅ AUTH SUCCESS - User: " + username);

    } catch (Exception e) {
      // Catch any unexpected errors to prevent server crashes
      System.out.println("❌ UNEXPECTED ERROR: " + e.getMessage());
      logger.error("Unexpected error in JWT filter", e);
      sendErrorResponse(response, "Authentication failed");
      return;
    }

    // Continue with the filter chain
    filterChain.doFilter(request, response);
  }

  private String extractTokenFromCookies(HttpServletRequest request) {
    if (request.getCookies() == null) {
      return null;
    }

    for (Cookie cookie : request.getCookies()) {
      if (TOKEN_COOKIE_NAME.equals(cookie.getName())) {
        return cookie.getValue();
      }
    }
    return null;
  }

  private void setSecurityHeaders(HttpServletResponse response) {
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("X-Content-Type-Options", "nosniff");
  }

  private boolean isPublicEndpoint(String uri) {
    for (String publicUrl : publicUrls) {
      boolean matches = pathMatcher.match(publicUrl, uri);
      if (matches) {
        return true;
      }
    }
    return false;
  }

  private boolean isValidTokenFormat(String token) {
    if (token == null || token.trim().isEmpty()) {
      return false;
    }

    // JWT should have exactly 3 parts separated by dots
    String[] parts = token.split("\\.");
    if (parts.length != 3) {
      return false;
    }

    // Basic validation - each part should not be empty
    for (String part : parts) {
      if (part.trim().isEmpty()) {
        return false;
      }
    }

    return true;
  }

  private Claims parseTokenSafely(String token) {
    try {
      SecretKey key = jwtTokenUtil.getSecretKey();
      return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();

    } catch (ExpiredJwtException e) {
      System.out.println("Token expired: " + e.getMessage());
      return null;
    } catch (MalformedJwtException e) {
      System.out.println("Malformed token: " + e.getMessage());
      return null;
    } catch (SignatureException e) {
      System.out.println("Invalid signature: " + e.getMessage());
      return null;
    } catch (UnsupportedJwtException e) {
      System.out.println("Unsupported token: " + e.getMessage());
      return null;
    } catch (IllegalArgumentException e) {
      System.out.println("Invalid token argument: " + e.getMessage());
      return null;
    } catch (Exception e) {
      System.out.println("Unexpected error parsing token: " + e.getMessage());
      return null;
    }
  }

  private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    String jsonResponse = String.format("{\"error\":\"%s\"}", message);
    response.getWriter().write(jsonResponse);
    response.getWriter().flush();
  }

  private final String[] publicUrls = {
    "/chattr/api/storm/provision/v1.3.2/auth/login",
    "/chattr/api/storm/provision/v1.3.2/auth/register",
    "/chattr/api/storm/provision/v1.3.2/internal/token",
    "/chattr/api/storm/provision/v1.3.2/auth/me",
    "/chattr/api/storm/provision/v1.3.2/auth/logout",
    "/chattr/api/storm/provision/v1.3.2/health",
    "/chattr/api/storm/provision/v1.3.2/hashtags/get",
    "/chattr/api/storm/provision/v1.3.2/hashtags/save",
    "/chattr/api/storm/provision/v1.3.2/create/questions"
  };
}
