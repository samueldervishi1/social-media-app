package com.chattr.server.repositories;

import com.chattr.server.models.User;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SearchUserRepository extends MongoRepository<User, String> {

  List<User> findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(
      String username, String fullName);
}
