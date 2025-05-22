package com.chattr.server.repositories;

import com.chattr.server.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchUserRepository extends MongoRepository<User, String> {

    List<User> findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(String username, String fullName);
}