package com.chattr.server.repositories;

import com.chattr.server.models.CommunityPost;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunityPostRepository extends MongoRepository<CommunityPost, String> {
  List<CommunityPost> findByCommunityName(String communityName);
}
