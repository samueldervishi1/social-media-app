package com.chattr.server.repositories;

import com.chattr.server.models.Community;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SearchRepository extends MongoRepository<Community, String> {

  List<Community> findByName(String name);
}
