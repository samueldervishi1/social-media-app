package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Community;
import com.chattr.server.models.CommunityPost;
import com.chattr.server.models.Faq;
import com.chattr.server.models.Messages;
import com.chattr.server.repositories.CommunityPostRepository;
import com.chattr.server.repositories.CommunityRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service class for managing communities and community posts. Handles creation,
 * updates, joining/unjoining, and retrieval.
 */
@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityPostRepository communityPostRepository;
    private final LoggingService loggingService;

    public CommunityService(CommunityRepository communityRepository, CommunityPostRepository communityPostRepository,
            LoggingService loggingService) {
        this.communityRepository = communityRepository;
        this.communityPostRepository = communityPostRepository;
        this.loggingService = loggingService;
    }

    public Community createCommunity(String name, String ownerId, String description, List<Faq> faqs) {
        communityRepository.findByName(name).ifPresent(existing -> {
            throw new CustomException(400, String.format(Messages.COMMUNITY_EXISTS, name));
        });

        Community community = new Community(name, ownerId, description);
        community.setUserIds(List.of(ownerId));
        community.setFaqs(faqs);

        return communityRepository.save(community);
    }

    public CommunityPost createCommunityPost(String name, String ownerId, String description) {
        Community community = getCommunityByName(name);

        CommunityPost post = new CommunityPost();
        post.setOwnerId(ownerId);
        post.setCommunityName(name);
        post.setContent(description);
        post.setCreateTime(LocalDateTime.now());
        post.setComments(new ArrayList<>());
        post.setDeleted(false);

        CommunityPost savedPost = communityPostRepository.save(post);
        community.getPostIds().add(savedPost.getId());
        communityRepository.save(community);

        return savedPost;
    }

    public Community updateCommunity(String communityId, String newName, String description, List<Faq> faqs) {
        Community community = getCommunityById(communityId);

        if (newName != null && !newName.equals(community.getName())) {
            communityRepository.findByName(newName).ifPresent(existing -> {
                throw new CustomException(400, String.format(Messages.COMMUNITY_EXISTS, newName));
            });

            String oldName = community.getName();
            community.setName(newName);

            List<CommunityPost> posts = communityPostRepository.findByCommunityName(oldName);
            for (CommunityPost post : posts) {
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
            loggingService.logError("CommunityService", "getUserCountForCommunity",
                    "Error fetching user count for community '" + name + "'", e);
            throw new CustomException(500, String.format(Messages.ERROR_500));
        }
    }

    public void joinCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);

        if (!community.getUserIds().contains(userId)) {
            community.getUserIds().add(userId);
            communityRepository.save(community);
        } else {
            throw new CustomException(400, String.format(Messages.ALREADY_MEMBER, userId));
        }
    }

    public void leaveCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);

        if (community.getUserIds().remove(userId)) {
            communityRepository.save(community);
        } else {
            throw new CustomException(400, String.format(Messages.NOT_A_MEMBER, userId));
        }
    }

    public Community getCommunityById(String communityId) {
        return communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.COMMUNITY_NOT_FOUND, communityId)));
    }

    public Community getCommunityByName(String name) {
        return communityRepository.findByName(name)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.COMMUNITY_NOT_FOUND, name)));
    }

    public List<Community> getCommunitiesByUserId(String userId) {
        try {
            return communityRepository.findByUserIdsContaining(userId);
        } catch (Exception e) {
            loggingService.logError("CommunityService", "getCommunitiesByUserId",
                    "Error fetching communities for user '" + userId + "'", e);
            throw new CustomException(500, String.format(Messages.ERROR_500));
        }
    }

    public CommunityPost getCommunityPostById(String postId) {
        return communityPostRepository.findById(postId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.POST_NOT_FOUND, postId)));
    }

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    public List<CommunityPost> getAllDBPosts() {
        return communityPostRepository.findAll();
    }
}
