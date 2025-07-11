package com.chattr.server.repositories;

import com.chattr.server.models.ModelUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelUpdateRepository extends MongoRepository<ModelUpdate, String> {

    List<ModelUpdate> findByStatus(String status);

    List<ModelUpdate> findByVersion(String version);

    List<ModelUpdate> findByModelName(String modelName);
}