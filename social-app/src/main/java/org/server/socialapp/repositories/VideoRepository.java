package org.server.socialapp.repositories;


import org.server.socialapp.models.Video;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VideoRepository extends MongoRepository<Video, String> {
}
