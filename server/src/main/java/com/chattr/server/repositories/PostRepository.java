package com.chattr.server.repositories;

import com.chattr.server.models.Post;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostRepository extends MongoRepository<Post, String> {

  List<Post> findByUserId(String userId);

  long countByUserIdAndDeletedFalse(String userId);
}
