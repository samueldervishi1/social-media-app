package com.chirp.server.repositories;

import com.chirp.server.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);

	Optional<User> findByUsername(String username);

	Optional<User> findUserById(String id);

	List<User> findByUsernameContaining(String username);
}
