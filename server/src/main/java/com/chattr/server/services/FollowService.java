package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.FollowRequest;
import com.chattr.server.models.FollowStatus;
import com.chattr.server.models.User;
import com.chattr.server.repositories.FollowRepository;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository, ActivityLogService activityLogService, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }

    public void sendFollowRequest(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<FollowRequest> existing = followRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Follow request already exists");
        }

        if (!receiver.isPrivate()) {
            addToFollowers(senderId, receiverId);
        } else {
            FollowRequest followRequest = new FollowRequest(senderId, receiverId, FollowStatus.PENDING);
            notificationService.sendFollowNotification(receiverId, sender.getUsername());
            activityLogService.log(senderId, "FOLLOW_REQUEST_SENT", receiverId + " has requested to follow you.");
            followRepository.save(followRequest);
        }
    }

    public void acceptFollowRequest(String requestId) {
        FollowRequest followRequest = followRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Follow request not found"));

        FollowStatus status = followRequest.getStatus();

        if (status != FollowStatus.PENDING && status != FollowStatus.FOLLOW_BACK) {
            throw new IllegalArgumentException("Follow request is not actionable");
        }

        followRequest.setStatus(FollowStatus.ACCEPTED);
        followRepository.save(followRequest);

        activityLogService.log(followRequest.getSenderId(), "FOLLOW_REQUEST_ACCEPTED",
                "You have accepted " + followRequest.getReceiverId() + "'s follow request.");

        addToFollowers(followRequest.getSenderId(), followRequest.getReceiverId());

        User receiver = userRepository.findById(followRequest.getReceiverId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        notificationService.sendFollowAcceptedNotification(
                followRequest.getSenderId(),
                receiver.getUsername()
        );
    }

    public void followBack(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Optional<FollowRequest> existing = followRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Follow request already exists");
        }

        FollowRequest followBackRequest = new FollowRequest(senderId, receiverId, FollowStatus.FOLLOW_BACK);
        notificationService.sendFollowNotification(receiverId, sender.getUsername());
        activityLogService.log(senderId, "FOLLOW_BACK_REQUESTED", "You have requested to follow back " + receiverId + ".");
        followRepository.save(followBackRequest);
    }

    public boolean isMutualFollow(String userAId, String userBId) {
        User userA = userRepository.findById(userAId)
                .orElseThrow(() -> new IllegalArgumentException("User A not found"));
        User userB = userRepository.findById(userBId)
                .orElseThrow(() -> new IllegalArgumentException("User B not found"));

        boolean aFollowsB = userA.getFollowing() != null && userA.getFollowing().contains(userBId);
        boolean bFollowsA = userB.getFollowing() != null && userB.getFollowing().contains(userAId);

        return aFollowsB && bFollowsA;
    }

    public List<String> getMutualConnections(String viewerId, String profileId) {
        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("Viewer not found"));

        List<String> mutualUsernames = new ArrayList<>();

        if (viewer.getFollowing() == null || viewer.getFollowing().isEmpty()) {
            return mutualUsernames;
        }

        for (String followedUserId : viewer.getFollowing()) {
            User followedUser = userRepository.findById(followedUserId).orElse(null);
            if (followedUser != null && followedUser.getFollowing() != null &&
                    followedUser.getFollowing().contains(profileId)) {
                mutualUsernames.add(followedUser.getUsername());
            }
        }

        return mutualUsernames;
    }

    public List<FollowRequest> getPendingFollowRequests(String userId) {
        return followRepository.findByReceiverIdAndStatus(userId, FollowStatus.PENDING);
    }

    public void rejectFollowRequest(String requestId, String receiverId) {
        FollowRequest request = followRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(404, "Follow request not found"));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new CustomException(403, "You can only reject requests sent to you");
        }

        if (request.getStatus() != FollowStatus.PENDING) {
            throw new CustomException(400, "Only pending requests can be rejected");
        }

        request.setStatus(FollowStatus.REJECTED);
        request.setTimestamp(LocalDateTime.now()); // Optional: update the timestamp to reflect the action time

        followRepository.save(request);
    }

    public FollowStatus getFollowStatus(String senderId, String receiverId) {
        return followRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .map(FollowRequest::getStatus)
                .orElse(FollowStatus.NONE);
    }

    private void addToFollowers(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        // receiver gets a new follower (sender)
        if (receiver.getFollowers() == null) receiver.setFollowers(new ArrayList<>());
        if (!receiver.getFollowers().contains(senderId)) {
            receiver.getFollowers().add(senderId);
        }

        // the sender is now following receiver
        if (sender.getFollowing() == null) sender.setFollowing(new ArrayList<>());
        if (!sender.getFollowing().contains(receiverId)) {
            sender.getFollowing().add(receiverId);
        }

        userRepository.save(receiver);
        userRepository.save(sender);
    }
}