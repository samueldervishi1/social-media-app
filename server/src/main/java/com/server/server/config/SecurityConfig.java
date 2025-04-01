package com.server.server.config;

import com.server.server.utils.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import org.springframework.context.annotation.Lazy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private static final List<String> PUBLIC_URLS = List.of("/tmf/server/api/v2.2.10/login",
			"/tmf/server/api/v2.2.10/register",
			"/tmf/server/api/v2.2.10/internal/token",
			"/tmf/server/api/v2.2.10/me",
			"/tmf/server/api/v2.2.10/logout",
			"/tmf/server/api/v2.2.10/health",
			"/tmf/server/api/v2.2.10/hashtags/get",
			"/tmf/server/api/v2.2.10/hashtags/save",
			"/tmf/server/api/v2.2.10/create/questions"
	);

	public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfig()))
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(PUBLIC_URLS.toArray(new String[0])).permitAll()
						.requestMatchers("/tmf/server/api/v2.2.10/**").authenticated()
						.anyRequest().permitAll()
				)
				.addFilterBefore(jwtAuthenticationFilter , UsernamePasswordAuthenticationFilter.class)
				.logout(AbstractHttpConfigurer::disable)
				.exceptionHandling(exception -> exception.authenticationEntryPoint((request , response , authException) -> {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.getWriter().write("Unauthorized Access");
				}));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfig() {
		return request -> {
			CorsConfiguration config = new CorsConfiguration();
			config.setAllowedMethods(List.of("GET" , "POST" , "PUT" , "DELETE" , "OPTIONS"));
			config.setAllowedHeaders(List.of("*"));
			config.setAllowedOrigins(List.of("http://localhost:5173"));
			config.setExposedHeaders(List.of("Authorization" , "Content-Type"));
			config.setAllowCredentials(true);
			return config;
		};
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}