package com.server.server.services;

import com.server.server.models.Hashtag;
import com.server.server.repositories.HashtagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HashtagService {
	private final HashtagRepository repository;

	public HashtagService(HashtagRepository repository) {
		this.repository = repository;
	}

	public List<Hashtag> getAllHashtags() {
		return repository.findAll();
	}

	public Hashtag saveHashtag(Hashtag hashtag) {
		return repository.save(hashtag);
	}
}