package com.chattr.server.repositories;

import com.chattr.server.models.User;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface SearchUserRepository extends MongoRepository<User, String> {

    @Query("{ $or: [ " + "{ 'username': { $regex: ?0, $options: 'i' } }, "
            + "{ 'fullName': { $regex: ?0, $options: 'i' } } " + "] }")
    List<User> findUsersWithTextSearch(String query, Pageable pageable);

    @Query("{ $or: [ " + "{ 'username': { $regex: '^.*?0.*$', $options: 'i' } }, "
            + "{ 'fullName': { $regex: '^.*?0.*$', $options: 'i' } } " + "] }")
    List<User> findUsersFlexibleSearch(String query, Pageable pageable);

    List<User> findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(String username, String fullName);
}
