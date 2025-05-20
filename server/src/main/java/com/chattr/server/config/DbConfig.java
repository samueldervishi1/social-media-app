package com.chattr.server.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.lang.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

/**
 * MongoDB configuration class.
 * Extends Spring Data's AbstractMongoClientConfiguration to configure database name and connection settings.
 */
@Configuration
public class DbConfig extends AbstractMongoClientConfiguration {

    /**
     * Name of the MongoDB database to connect to.
     * Configured via application properties (spring.data.mongodb.database).
     */
    @Value("${spring.data.mongodb.database}")
    private String dbName;

    /**
     * Full MongoDB connection URI (including credentials and host).
     * Configured via application properties (spring.data.mongodb.uri).
     */
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    /**
     * Returns the name of the MongoDB database.
     * This is used by Spring Data MongoDB as the default database for repositories.
     */
    @Override
    @NonNull
    protected String getDatabaseName() {
        return dbName;
    }

    /**
     * Configures the MongoDB client settings, including the connection URI.
     *
     * @param builder a builder for MongoClientSettings
     */
    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder.applyConnectionString(new ConnectionString(mongoUri));
    }
}