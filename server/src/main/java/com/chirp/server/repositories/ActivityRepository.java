package com.chirp.server.repositories;

import com.chirp.server.models.ActivityModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityRepository extends MongoRepository<ActivityModel, String> {
	List<ActivityModel> findByUserId(String userId);
}
