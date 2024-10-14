package org.server.socialapp.repositories;

import org.server.socialapp.models.ImagesCollection;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageRepository extends MongoRepository<ImagesCollection, String> {
}
