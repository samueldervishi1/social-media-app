package org.server.socialapp.repositories;

import org.server.socialapp.models.ActivityModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityRepository extends MongoRepository<ActivityModel, String> {
    List<ActivityModel> findByUserId(String userId);

    ActivityModel findFirstByUserId(String userId);
}
