package com.chattr.server.config;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.User;
import com.chattr.server.services.LoggingService;
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
    private final LoggingService loggingService;

    @PostConstruct
    public void createIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps(User.class);

        try {
            indexOps.ensureIndex(new Index().on("username", Sort.Direction.ASC).unique());

            indexOps.ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());

            indexOps.ensureIndex(new Index().on("email", Sort.Direction.ASC).on("username", Sort.Direction.ASC)
                    .named("email_username_compound"));

            indexOps.ensureIndex(new Index().on("lastLoginTime", Sort.Direction.DESC));

        } catch (Exception e) {
            loggingService.logError("MongoIndexConfig", "createIndexes", "Failed to create MongoDB indexes", e);
            throw new CustomException(500, String.valueOf(e));
        }
    }
}
