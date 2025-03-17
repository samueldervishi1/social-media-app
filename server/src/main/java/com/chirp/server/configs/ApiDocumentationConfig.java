package com.chirp.server.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiDocumentationConfig {

	private static final String BASE_URL = "http://localhost:8080/api/v2.1.5/";
	private static final String API_TITLE = "API Documentation";
	private static final String API_VERSION = "2.1.1";
	private static final String CONTACT_NAME = "Samuel";
	private static final String CONTACT_EMAIL = "samueldervishi02@gmail.com";

	@Bean
	public OpenAPI apiDocConfig() {
		Server server = new Server()
				.url(BASE_URL)
				.description("Development Server");

		Contact contact = new Contact()
				.name(CONTACT_NAME)
				.email(CONTACT_EMAIL);

		Info info = new Info()
				.title(API_TITLE)
				.version(API_VERSION)
				.description("[ Base URL: " + BASE_URL + " ]")
				.contact(contact);

		return new OpenAPI()
				.info(info)
				.addServersItem(server);
	}
}