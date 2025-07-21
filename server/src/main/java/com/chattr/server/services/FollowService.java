package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.FollowRequest;
import com.chattr.server.models.FollowStatus;
import com.chattr.server.models.Messages;
import com.chattr.server.models.User;
import com.chattr.server.repositories.FollowRepository;
import com.chattr.server.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository,
            NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void sendFollowRequest(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.SENDER_ERROR)));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, receiverId)));

        Optional<FollowRequest> existing = followRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (existing.isPresent()) {
            throw new CustomException(404, String.format(Messages.FOLLOW_EXISTS));
        }

        if (!receiver.isPrivate()) {
            addToFollowers(senderId, receiverId);
        } else {
            FollowRequest followRequest = new FollowRequest(senderId, receiverId, FollowStatus.PENDING);
            notificationService.sendFollowNotification(receiverId, sender.getUsername());
            followRepository.save(followRequest);
        }
    }

    public void acceptFollowRequest(String requestId) {
        FollowRequest followRequest = followRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.FOLLOW_NOT_FOUND, requestId)));

        FollowStatus status = followRequest.getStatus();

        if (status != FollowStatus.PENDING && status != FollowStatus.FOLLOW_BACK) {
            throw new CustomException(404, String.format(Messages.FOLLOW_NOT_ACTIONABLE));
        }

        followRequest.setStatus(FollowStatus.ACCEPTED);
        followRepository.save(followRequest);
        addToFollowers(followRequest.getSenderId(), followRequest.getReceiverId());

        User receiver = userRepository.findById(followRequest.getReceiverId())
                .orElseThrow(() -> new CustomException(404,
                        String.format(Messages.RECEIVER_NOT_FOUND, followRequest.getReceiverId())));

        notificationService.sendFollowAcceptedNotification(followRequest.getSenderId(), receiver.getUsername());
    }

    public void followBack(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.SENDER_ERROR)));

        Optional<FollowRequest> existing = followRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (existing.isPresent()) {
            throw new CustomException(400, String.format(Messages.FOLLOW_EXISTS));
        }

        FollowRequest followBackRequest = new FollowRequest(senderId, receiverId, FollowStatus.FOLLOW_BACK);
        notificationService.sendFollowNotification(receiverId, sender.getUsername());
        followRepository.save(followBackRequest);
    }

    public boolean isMutualFollow(String userAId, String userBId) {
        User userA = userRepository.findById(userAId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userAId)));
        User userB = userRepository.findById(userBId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, userBId)));

        boolean aFollowsB = userA.getFollowing() != null && userA.getFollowing().contains(userBId);
        boolean bFollowsA = userB.getFollowing() != null && userB.getFollowing().contains(userAId);

        return aFollowsB && bFollowsA;
    }

    public List<String> getMutualConnections(String viewerId, String profileId) {
        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.USER_NOT_FOUND, viewerId)));

        List<String> mutualUsernames = new ArrayList<>();

        if (viewer.getFollowing() == null || viewer.getFollowing().isEmpty()) {
            return mutualUsernames;
        }

        for (String followedUserId : viewer.getFollowing()) {
            User followedUser = userRepository.findById(followedUserId).orElse(null);
            if (followedUser != null && followedUser.getFollowing() != null
                    && followedUser.getFollowing().contains(profileId)) {
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
                .orElseThrow(() -> new CustomException(404, String.format(Messages.FOLLOW_NOT_FOUND, requestId)));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new CustomException(403, String.format(Messages.REFUSE));
        }

        if (request.getStatus() != FollowStatus.PENDING) {
            throw new CustomException(400, String.format(Messages.PENDING));
        }

        request.setStatus(FollowStatus.REJECTED);
        request.setTimestamp(LocalDateTime.now());

        followRepository.save(request);
    }

    public FollowStatus getFollowStatus(String senderId, String receiverId) {
        return followRepository.findBySenderIdAndReceiverId(senderId, receiverId).map(FollowRequest::getStatus)
                .orElse(FollowStatus.NONE);
    }

    private void addToFollowers(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.SENDER_ERROR)));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new CustomException(404, String.format(Messages.RECEIVER_NOT_FOUND, receiverId)));

        if (receiver.getFollowers() == null)
            receiver.setFollowers(new ArrayList<>());
        if (!receiver.getFollowers().contains(senderId)) {
            receiver.getFollowers().add(senderId);
        }

        if (sender.getFollowing() == null)
            sender.setFollowing(new ArrayList<>());
        if (!sender.getFollowing().contains(receiverId)) {
            sender.getFollowing().add(receiverId);
        }

        userRepository.save(receiver);
        userRepository.save(sender);
    }
}
