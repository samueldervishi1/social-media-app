package com.chattr.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Chattr server. Configures Spring Boot with MongoDB, caching, async
 * processing, and scheduling.
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
@EnableMongoRepositories(basePackages = "com.chattr.server.repositories")
@ConfigurationPropertiesScan("com.chattr.server.config")
public class ServerApplication {

  public static void main(String[] args) {
    System.setProperty("spring.application.name", "chattr-server");
    SpringApplication app = new SpringApplication(ServerApplication.class);
    app.run(args);
  }
}
