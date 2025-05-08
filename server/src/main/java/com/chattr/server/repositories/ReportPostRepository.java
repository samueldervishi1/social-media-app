package com.chattr.server.repositories;

import com.chattr.server.models.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportPostRepository extends MongoRepository<Report, String> {
    boolean existsByUserIdAndPostId(String userId, String postId);
}