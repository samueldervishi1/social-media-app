package com.chattr.server.config;

import com.chattr.server.models.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void createIndexes() {
        log.info("Creating MongoDB indexes...");

        IndexOperations indexOps = mongoTemplate.indexOps(User.class);

        try {
            indexOps.ensureIndex(new Index().on("username", Sort.Direction.ASC).unique());
            log.info("Created unique index on username");

            indexOps.ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
            log.info("Created unique index on email");

            indexOps.ensureIndex(new Index()
                    .on("email", Sort.Direction.ASC)
                    .on("username", Sort.Direction.ASC)
                    .named("email_username_compound"));
            log.info("Created compound index on email+username");

            indexOps.ensureIndex(new Index().on("lastLoginTime", Sort.Direction.DESC));
            log.info("Created index on lastLoginTime");

            log.info("All MongoDB indexes created successfully");

        } catch (Exception e) {
            log.error("Failed to create MongoDB indexes", e);
        }
    }
}