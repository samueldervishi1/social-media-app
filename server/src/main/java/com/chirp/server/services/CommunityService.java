package com.chirp.server.services;

import com.chirp.server.models.Community;
import com.chirp.server.repositories.CommunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository communityRepository;

    public Community createCommunity(String name, String ownerId, String description) {
        Optional<Community> existingCommunity = communityRepository.findByName(name);
        if (existingCommunity.isPresent()) {
            throw new IllegalArgumentException("Community with name " + name + " already exists");
        }

        Community community = new Community(name, ownerId, description);
        return communityRepository.save(community);
    }

    public void joinCommunity(String communityId, String userId) {
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

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }
}
