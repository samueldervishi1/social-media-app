package com.chirp.server.configs;

import com.chirp.server.utils.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Value("${build.url}")
	private String buildUrl;

	@Value("${app.url}")
	private String appUrl;

	@Value("${backend.url}")
	private String backendUrl;

	private static final List<String> ALLOWED_METHODS = List.of("GET" , "POST" , "PUT" , "DELETE" , "OPTIONS");
	private static final List<String> ALLOWED_HEADERS = List.of("Authorization" , "Content-Type" , "*");
	private static final List<String> PUBLIC_URLS = List.of(
			"/hyper-api/auranet/v2.1.5/system-heartbeat" ,
			"/hyper-api/auranet/v2.1.5/access-core/neural-link" ,
			"/hyper-api/auranet/v2.1.5/access-core/init-sequence" ,
			"/tmf-api/auranet/v2.1.5/profile/quantum-shift/cipher-reset/"
	);

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfig()))
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(PUBLIC_URLS.toArray(new String[0])).permitAll()
						.requestMatchers("/hyper-api/auranet/v2.1.5/**").authenticated()
						.anyRequest().permitAll()
				)
				.addFilterBefore(jwtAuthenticationFilter , UsernamePasswordAuthenticationFilter.class)
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
			config.addAllowedOrigin(frontendUrl);
			config.addAllowedOrigin(buildUrl);
			config.addAllowedOrigin(appUrl);
			config.addAllowedOrigin(backendUrl);
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