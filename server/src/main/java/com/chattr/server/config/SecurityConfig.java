package com.chattr.server.config;

import com.chattr.server.utils.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for the application.
 * Configures CORS, JWT authentication filter, public/private routes, and password encoding.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Value("${cors.allowed-origins}")
	private String allowedOrigins;

	@Value("${security.public-urls}")
	private String[] publicUrls;

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	/**
	 * Constructor injection for JwtAuthenticationFilter.
	 * Uses @Lazy to prevent circular dependency issues if any.
	 */
	public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	/**
	 * Main security filter chain bean.
	 * - Applies JWT authentication
	 * - Defines public vs protected URLs
	 * - Handles CORS, disables CSRF & logout
	 * - Sets up a custom unauthorized response handler
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfig()))
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(publicUrls).permitAll() // Publicly accessible endpoints
						.requestMatchers("/tmf/server/api/v2.2.10/**").authenticated() // Protected API path
						.requestMatchers(HttpMethod.OPTIONS , "/**").permitAll() // Allow pre-flight requests
						.anyRequest().permitAll() // Allow all other requests (adjust as needed)
				)
				.addFilterBefore(jwtAuthenticationFilter , UsernamePasswordAuthenticationFilter.class)
				.logout(AbstractHttpConfigurer::disable)
				.exceptionHandling(exception -> exception.authenticationEntryPoint((request , response , authException) -> {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setContentType("text/plain");
					response.getWriter().write("Unauthorized Access");
				}));

		return http.build();
	}

	/**
	 * CORS configuration bean.
	 * - Allows specific origins
	 * - Allows common HTTP methods
	 * - Exposes headers such as Authorization
	 */
	@Bean
	public CorsConfigurationSource corsConfig() {
		return request -> {
			CorsConfiguration config = new CorsConfiguration();
			config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
			config.setAllowedMethods(List.of("GET" , "POST" , "PUT" , "DELETE" , "OPTIONS"));
			config.setAllowedHeaders(List.of("*"));
			config.setExposedHeaders(List.of("Authorization" , "Content-Type"));
			config.setAllowCredentials(true);
			return config;
		};
	}

	/**
	 * Password encoder bean using BCrypt.
	 * Recommended for secure password hashing.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}