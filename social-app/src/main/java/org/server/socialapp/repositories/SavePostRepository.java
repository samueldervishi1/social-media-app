package org.server.socialapp.repositories;

import org.server.socialapp.models.SavePost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SavePostRepository extends MongoRepository<SavePost, String> {
    Optional<SavePost> findByUserId(String userId);

    List<SavePost> findByPostIdsContaining(String postId);

}