package com.chattr.server.repositories;

import com.chattr.server.models.Post;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByUserId(String userId);

    long countByUserIdAndDeletedFalse(String userId);

    @Query("{ 'deleted': { $ne: true } }")
    Page<Post> findAllActivePostsPaged(Pageable pageable);

    @Query("{ 'userId': ?0, 'deleted': { $ne: true } }")
    List<Post> findActivePostsByUserId(String userId);

    @Query(value = "{ 'deleted': { $ne: true }, 'likedUserIds': { $exists: true, $not: { $size: 0 } } }", sort = "{ 'likedUserIds': -1 }")
    List<Post> findTopPostsByLikes(Pageable pageable);

    @Query("{ '_id': ?0, 'likedUserIds': ?1 }")
    boolean existsByIdAndLikedUserId(String postId, String userId);

    @Query("{ '_id': { $in: ?0 }, 'deleted': { $ne: true } }")
    List<Post> findActivePostsByIds(List<String> postIds);
}
