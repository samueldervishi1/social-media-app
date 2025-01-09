package com.chirp.server.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiDocumentationConfig {

	@Bean
	public OpenAPI apiDocConfig() {
		return new OpenAPI()
				.info(new Info()
						.title("CHYRA API Documentation")
						.version("2.1.1")
						.description("[ Base URL: localhost:8080/chyra-connectApi/v2/ ]")
						.contact(new Contact()
								.name("Samuel")
								.email("samueldervishi02@gmail.com")))
				.addServersItem(new Server()
						.url("http://localhost:8080/chyra-connectApi/v2/")
						.description("Development Server"));
	}
}