package org.server.socialapp.repositories;

import org.server.socialapp.models.Comments;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentsRepository extends MongoRepository<Comments, String> {
}
