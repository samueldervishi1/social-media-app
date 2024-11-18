package com.chirp.server.services;

import com.chirp.server.exceptions.InternalServerErrorException;
import com.chirp.server.models.Community;
import com.chirp.server.models.Like;
import com.chirp.server.repositories.CommunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

	private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

	@Autowired
	private CommunityRepository communityRepository;

	public Community createCommunity(String name , String ownerId , String description) {
		Optional<Community> existingCommunity = communityRepository.findByName(name);
		if (existingCommunity.isPresent()) {
			throw new IllegalArgumentException("Community with name " + name + " already exists");
		}

		Community community = new Community(name , ownerId , description);
		return communityRepository.save(community);
	}

	public int getUserCountForCommunity(String name) {
		try {
			List<Community> communities = communityRepository.findByNameContaining(name);
			return communities.size();
		} catch (Exception e) {
			logger.error("Error fetching likes count for post ID {}: {}" , name , e.getMessage() , e);
			throw new InternalServerErrorException("An unexpected error occurred while fetching likes count for the post");
		}
	}

	public void joinCommunity(String communityId , String userId) {
		Community community = communityRepository.findById(communityId)
				.orElseThrow(() -> new IllegalArgumentException("Community with id " + communityId + " does not exist"));

		if (!community.getUserIds().contains(userId)) {
			community.getUserIds().add(userId);
			communityRepository.save(community);
		}
	}

	public Community getCommunityById(String communityId) {
		Optional<Community> community = communityRepository.findById(communityId);
		if (community.isEmpty()) {
			throw new IllegalArgumentException("Community with ID " + communityId + " does not exist");
		}
		return community.get();
	}

	public Community getCommunityByName(String name) {
		Optional<Community> community = communityRepository.findByName(name);
		if (community.isEmpty()) {
			throw new IllegalArgumentException("Community with name " + name + " does not exist");
		}
		return community.get();
	}

	public List<Community> getAllCommunities() {
		return communityRepository.findAll();
	}
}
