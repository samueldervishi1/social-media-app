package com.chirp.server.utils;

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

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtTokenUtil jwtTokenUtil;

	@Autowired
	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request , HttpServletResponse response , FilterChain filterChain) throws ServletException, IOException {
		response.setHeader("X-Frame-Options" , "DENY");
		response.setHeader("X-Content-Type-Options" , "nosniff");

		String authorizationHeader = request.getHeader("Authorization");

		String requestURI = request.getRequestURI();
		if (requestURI.equals("/api/v2/auth/register") || requestURI.equals("/api/v2/auth/login") || requestURI.equals("/api/v2/ping")) {
			filterChain.doFilter(request , response);
			return;
		}


		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			String token = authorizationHeader.substring(7);

			try {
				Claims claims = Jwts.parser()
						.setSigningKey(jwtTokenUtil.getSecretKey())
						.build()
						.parseClaimsJws(token)
						.getBody();

				String username = claims.getSubject();
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username , null , null);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (Exception e) {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED , "Invalid token");
				return;
			}
		}

		filterChain.doFilter(request , response);
	}
}
