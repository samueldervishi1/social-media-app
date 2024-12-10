package com.chirp.server.configs;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class DbConfig extends AbstractMongoClientConfiguration {

	@Value("${spring.data.mongodb.database}")
	private String dbName;

	@Value("${spring.data.mongodb.uri}")
	private String mongoURI;

	@Override
	protected String getDatabaseName() {
		return dbName;
	}

	@Override
	protected void configureClientSettings(MongoClientSettings.Builder settings) {
		settings.applyConnectionString(new ConnectionString(mongoURI));
	}
}