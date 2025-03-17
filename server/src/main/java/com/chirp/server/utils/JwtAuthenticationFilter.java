package com.chirp.server.utils;

import com.mongodb.lang.NonNull;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenUtil jwtTokenUtil;
	private static final Set<String> EXCLUDED_URIS = new HashSet<>();
	private static final String REQUIRED_HEADER = "X-App-Version";

	static {
		EXCLUDED_URIS.add("/hyper-api/auranet/v2.1.5/access-core/init-sequence");
		EXCLUDED_URIS.add("/hyper-api/auranet/v2.1.5/access-core/neural-link");
		EXCLUDED_URIS.add("/hyper-api/auranet/v2.1.5/system-heartbeat");
		EXCLUDED_URIS.add("/tmf-api/auranet/v2.1.5/profile/quantum-shift/cipher-reset");
	}

	@Autowired
	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request , @NonNull HttpServletResponse response , @NonNull FilterChain filterChain)
			throws ServletException, IOException {

		setSecurityHeaders(response);
		if (request.getHeader(REQUIRED_HEADER) == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST , "Missing required header: " + REQUIRED_HEADER);
			return;
		}

		if (isExcludedUri(request.getRequestURI())) {
			filterChain.doFilter(request , response);
			return;
		}

		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			String token = authorizationHeader.substring(7);

			try {
				Claims claims = parseToken(token);

				String username = claims.getSubject();
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(username , null , null);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (Exception e) {
				logger.error("Invalid token: {}");
				response.sendError(HttpServletResponse.SC_FORBIDDEN , "Invalid token");
				return;
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED , "Authorization header is missing or invalid");
			return;
		}

		filterChain.doFilter(request , response);
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