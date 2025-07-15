package com.chattr.server.services;

import com.chattr.server.models.Hashtag;
import com.chattr.server.repositories.HashtagRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service layer for managing hashtag persistence and retrieval. */
@Service
public class HashtagService {

  private final HashtagRepository repository;

  public HashtagService(HashtagRepository repository) {
    this.repository = repository;
  }

  public List<Hashtag> getAllHashtags() {
    return repository.findAll();
  }

  public Hashtag createHashtag(Hashtag hashtag) {
    return repository.save(hashtag);
  }
}
