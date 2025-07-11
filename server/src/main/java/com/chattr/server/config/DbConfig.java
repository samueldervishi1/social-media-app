package com.chattr.server.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.ReadConcern;
import com.mongodb.ReadPreference;
import com.mongodb.WriteConcern;
import com.mongodb.lang.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.*;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

/**
 * MongoDB configuration class with performance optimizations.
 * Extends Spring Data's AbstractMongoClientConfiguration to configure database name and connection settings.
 */
@Configuration
public class DbConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.database}")
    private String dbName;

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Value("${spring.data.mongodb.max-connection-pool-size:100}")
    private int maxConnectionPoolSize;

    @Value("${spring.data.mongodb.min-connection-pool-size:10}")
    private int minConnectionPoolSize;

    @Value("${spring.data.mongodb.max-connection-idle-time:60000}")
    private long maxConnectionIdleTime;

    @Value("${spring.data.mongodb.max-wait-time:30000}")
    private long maxWaitTime;

    @Value("${spring.data.mongodb.socket-timeout:30000}")
    private int socketTimeout;

    @Value("${spring.data.mongodb.connect-timeout:10000}")
    private int connectTimeout;

    @Override
    @NonNull
    protected String getDatabaseName() {
        return dbName;
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder
                .applyConnectionString(new ConnectionString(mongoUri))
                // Connection pool optimization
                .applyToConnectionPoolSettings(poolBuilder -> poolBuilder
                        .maxSize(maxConnectionPoolSize)
                        .minSize(minConnectionPoolSize)
                        .maxConnectionIdleTime(maxConnectionIdleTime, TimeUnit.MILLISECONDS)
                        .maxWaitTime(maxWaitTime, TimeUnit.MILLISECONDS)
                )
                // Socket timeout settings
                .applyToSocketSettings(socketBuilder -> socketBuilder
                        .connectTimeout(connectTimeout, TimeUnit.MILLISECONDS)
                        .readTimeout(socketTimeout, TimeUnit.MILLISECONDS)
                )
                // Server selection timeout
                .applyToClusterSettings(clusterBuilder -> clusterBuilder
                        .serverSelectionTimeout(5000, TimeUnit.MILLISECONDS)
                )
                // Read/Write preferences for better performance
                .readPreference(ReadPreference.primaryPreferred())
                .writeConcern(WriteConcern.ACKNOWLEDGED)
                .readConcern(ReadConcern.LOCAL)
                // Compression for network efficiency
                .compressorList(Collections.singletonList(
                        com.mongodb.MongoCompressor.createZlibCompressor()
                ));
    }

    @Bean
    @NonNull
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Collections.emptyList());
    }

    @Bean
    @Override
    @NonNull
    public MappingMongoConverter mappingMongoConverter(@NonNull  MongoDatabaseFactory databaseFactory,
                                                       @NonNull MongoCustomConversions customConversions,
                                                       @NonNull MongoMappingContext mappingContext) {
        DbRefResolver dbRefResolver = new DefaultDbRefResolver(databaseFactory);
        MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, mappingContext);

        converter.setTypeMapper(new DefaultMongoTypeMapper(null));

        // Apply custom conversions
        converter.setCustomConversions(customConversions);

        // Initialize after properties set
        converter.afterPropertiesSet();

        return converter;
    }
}