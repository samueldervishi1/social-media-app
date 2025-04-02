package com.server.server.utils;

import com.mongodb.lang.NonNull;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Set;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final String REQUIRED_HEADER = "X-App-Version";
	private static final Set<String> EXCLUDED_URIS = Set.of("/tmf/server/api/v2.2.10/login" ,
			"/tmf/server/api/v2.2.10/register" ,
			"/tmf/server/api/v2.2.10/internal/token",
			"/tmf/server/api/v2.2.10/me",
			"/tmf/server/api/v2.2.10/logout",
			"/tmf/server/api/v2.2.10/health",
			"/tmf/server/api/v2.2.10/hashtags/get",
			"/tmf/server/api/v2.2.10/hashtags/save",
			"/tmf/server/api/v2.2.10/create/questions",
			"/tmf/server/api/v2.2.10/swagger-ui.html",
			"/tmf/server/api/v2.2.10/swagger-ui/index.html",
			"/tmf/server/api/v2.2.10/swagger-ui/**",
			"/tmf/server/api/v2.2.10/v3/api-docs",
			"/tmf/server/api/v2.2.10/v3/api-docs/**"
	);
	private final JwtTokenUtil jwtTokenUtil;

	@Autowired
	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request , @NonNull HttpServletResponse response , @NonNull FilterChain filterChain)
			throws ServletException, IOException {

		setSecurityHeaders(response);
		String appVersion = request.getHeader(REQUIRED_HEADER);
		if (appVersion == null || !appVersion.equals("2.2.10")) {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED ,
					"Missing or invalid required header: " + REQUIRED_HEADER + ". Expected: 2.2.10");
			return;
		}

		if (isExcludedUri(request.getRequestURI())) {
			filterChain.doFilter(request , response);
			return;
		}

		String token = getTokenFromCookie(request);

		if (token != null) {
			try {
				Claims claims = parseToken(token);

				String username = claims.getSubject();
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(username , null , null);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (Exception e) {
				logger.error("Invalid token" , e);
				response.sendError(HttpServletResponse.SC_FORBIDDEN , "Invalid token");
				return;
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED , "Token cookie is missing");
			return;
		}


		filterChain.doFilter(request , response);
	}

	private String getTokenFromCookie(HttpServletRequest request) {
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("token".equals(cookie.getName())) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}

	private void setSecurityHeaders(HttpServletResponse response) {
		response.setHeader("X-Frame-Options" , "DENY");
		response.setHeader("X-Content-Type-Options" , "nosniff");
	}

	private boolean isExcludedUri(String requestURI) {
		return EXCLUDED_URIS.contains(requestURI);
	}

	private Claims parseToken(String token) {
		SecretKey key = jwtTokenUtil.getSecretKey();
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}