package com.chirp.server.utils;

import com.chirp.server.exceptions.CustomException;
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

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenUtil jwtTokenUtil;
	private static final Set<String> EXCLUDED_URIS = new HashSet<>();

	static {
		EXCLUDED_URIS.add("/api/v2/auth/register");
		EXCLUDED_URIS.add("/api/v2/auth/login");
		EXCLUDED_URIS.add("/api/v2/ping");
		EXCLUDED_URIS.add("/api/v2/users/update-password");
	}

	@Autowired
	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request , HttpServletResponse response , FilterChain filterChain)
			throws ServletException, IOException {

		setSecurityHeaders(response);

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
				logger.error("Invalid token, error: {}" , e);
				throw new CustomException(401 , "Invalid token");
			}
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
		return Jwts.parser()
				.setSigningKey(jwtTokenUtil.getSecretKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
}