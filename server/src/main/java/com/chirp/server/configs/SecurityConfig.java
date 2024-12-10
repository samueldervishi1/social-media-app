package com.chirp.server.configs;

import com.chirp.server.utils.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Value("${build.url}")
	private String buildUrl;

	private static final List<String> ALLOWED_METHODS = List.of("GET" , "POST" , "PUT" , "DELETE" , "OPTIONS");
	private static final List<String> ALLOWED_HEADERS = List.of("Authorization" , "*");
	private static final List<String> PUBLIC_URLS = List.of(
			"/api/v2/ping" ,
			"/api/v2/auth/login" ,
			"/api/v2/users/auth/register" ,
			"/api/v2/auth/2fa-status/**" ,
			"/api/v2/users/update-password"
	);

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfig()))
				.csrf(csrf -> csrf.disable())
				.authorizeRequests(auth -> auth
						.requestMatchers(PUBLIC_URLS.toArray(new String[0])).permitAll()
						.requestMatchers("/api/v2/**").authenticated()
						.anyRequest().permitAll()
				)
				.addFilterBefore(jwtAuthenticationFilter , UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfig() {
		return request -> {
			CorsConfiguration config = new CorsConfiguration();
			config.addAllowedOrigin(frontendUrl);
			config.addAllowedOrigin(buildUrl);
			config.setAllowedMethods(ALLOWED_METHODS);
			config.setAllowedHeaders(ALLOWED_HEADERS);
			config.setAllowCredentials(true);
			return config;
		};
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}