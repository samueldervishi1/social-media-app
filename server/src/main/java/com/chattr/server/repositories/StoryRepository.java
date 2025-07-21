package com.chattr.server.repositories;

import com.chattr.server.models.Story;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StoryRepository extends MongoRepository<Story, String> {

    List<Story> findByUserIdAndExpiresAtAfter(String userId, LocalDateTime now);

    List<Story> findByExpiresAtAfter(LocalDateTime now);

}
