package com.chattr.server.services;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.bson.Document;

import java.util.Date;

@Service
public class VersionTracker {

    private final MongoTemplate mongoTemplate;

    public VersionTracker(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void trackVersion() {
        System.out.println(appName + " v" + version + " started!");
        Query query = new Query(Criteria.where("version").is(version));
        Document existingVersion = mongoTemplate.findOne(query, Document.class, "app_versions");

        if (existingVersion == null) {
            Document versionDoc = new Document().append("appName", appName).append("version", version)
                    .append("description", description).append("changelog", changelog)
                    .append("firstDeployed", new Date()).append("contextPath", "/chattr/api/core/v" + version)
                    .append("status", "active");

            mongoTemplate.save(versionDoc, "app_versions");
        } else {
            mongoTemplate.updateFirst(query, Update.update("lastSeen", new Date()), "app_versions");
        }
    }

    @Value("${app.version}")
    private String version;

    @Value("${app.name}")
    private String appName;

    @Value("${app.description:No description provided}")
    private String description;

    @Value("${app.changelog:No changelog provided}")
    private String changelog;
}
