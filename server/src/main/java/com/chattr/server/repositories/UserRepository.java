package com.chattr.server.repositories;

import com.chattr.server.models.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByIdIn(List<String> ids);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'username': 1 }")
    Optional<User> findUsernameById(String userId);

    @Query(value = "{ '_id': { $in: ?0 } }", fields = "{ 'username': 1, 'fullName': 1 }")
    List<User> findUserLiteByIdIn(List<String> ids);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'followers': 1 }")
    Optional<User> findFollowersById(String userId);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'following': 1 }")
    Optional<User> findFollowingById(String userId);

    boolean existsById(String userId);
}
