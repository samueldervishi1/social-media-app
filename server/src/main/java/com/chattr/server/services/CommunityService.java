package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.repositories.CommunityPostRepository;
import com.chattr.server.repositories.CommunityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityPostRepository communityPostRepository;

    public CommunityService(CommunityRepository communityRepository, CommunityPostRepository communityPostRepository) {
        this.communityRepository = communityRepository;
        this.communityPostRepository = communityPostRepository;
    }

    public Community createCommunity(String name, String ownerId, String description, List<Faq> faqs) {
        communityRepository.findByName(name).ifPresent(community -> {
            throw new CustomException(400, String.format(String.format(Codes.COMMUNITY_EXISTS, name)));
        });

        Community community = new Community(name, ownerId, description);
        community.setUserIds(List.of(ownerId));
        community.setFaqs(faqs);

        return communityRepository.save(community);
    }

    public CommunityPost createCommunityPost(String name, String ownerId, String description) {
        Community community = getCommunityByName(name);

        CommunityPost communityPost = new CommunityPost();
        communityPost.setOwnerId(ownerId);
        communityPost.setCommunityName(name);
        communityPost.setContent(description);
        communityPost.setCreateTime(LocalDateTime.now());
        communityPost.setComments(new ArrayList<>());
        communityPost.setDeleted(false);

        CommunityPost savedPost = communityPostRepository.save(communityPost);

        community.getPostIds().add(savedPost.getId());
        communityRepository.save(community);
        return savedPost;
    }

    public Community updateCommunity(String communityId, String newName, String description, List<Faq> faqs) {
        Community community = getCommunityById(communityId);

        if (newName != null && !newName.equals(community.getName())) {
            Optional<Community> existingCommunity = communityRepository.findByName(newName);

            if (existingCommunity.isPresent()) {
                throw new CustomException(400, String.format(Codes.COMMUNITY_EXISTS, newName));
            }

            community.setName(newName);

            List<CommunityPost> communityPosts = communityPostRepository.findByCommunityName(community.getName());
            for (CommunityPost post : communityPosts) {
                post.setCommunityName(newName);
                communityPostRepository.save(post);
            }
        }

        if (description != null) {
            community.setDescription(description);
        }
        if (faqs != null && !faqs.isEmpty()) {
            community.setFaqs(faqs);
        }
        return communityRepository.save(community);
    }

    public int getUserCountForCommunity(String name) {
        try {
            return communityRepository.getUserCountForCommunity(name).orElse(0);
        } catch (Exception e) {
            throw new CustomException(500, "Error fetching user count");
        }
    }

    public void joinCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        if (!community.getUserIds().contains(userId)) {
            community.getUserIds().add(userId);
            communityRepository.save(community);
        }
    }

    public void unjoinCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        if (community.getUserIds().contains(userId)) {
            community.getUserIds().remove(userId);
            communityRepository.save(community);
        } else {
            throw new CustomException(400, "User is not a member of this community.");
        }
    }

    public Community getCommunityById(String communityId) {
        return communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException(404, String.format(String.format(Codes.COMMUNITY_NOT_FOUND, communityId))));
    }

    public Community getCommunityByName(String name) {
        return communityRepository.findByName(name)
                .orElseThrow(() -> new CustomException(404, String.format(Codes.COMMUNITY_NOT_FOUND, name)));
    }

    public List<Community> getCommunitiesByUserId(String userId) {
        try {
            return communityRepository.findByUserIdsContaining(userId);
        } catch (Exception e) {
            throw new CustomException(500, "Error fetching communities");
        }
    }

    public CommunityPost getCommunityPostById(String postId) {
        return communityPostRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Codes.POST_NOT_FOUND, postId)));
    }

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    public List<CommunityPost> getAllDBPosts() {
        return communityPostRepository.findAll();
    }
}