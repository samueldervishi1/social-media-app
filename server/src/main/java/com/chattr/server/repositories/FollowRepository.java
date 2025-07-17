package com.chattr.server.repositories;

import com.chattr.server.models.FollowRequest;
import com.chattr.server.models.FollowStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FollowRepository extends MongoRepository<FollowRequest, String> {
    Optional<FollowRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);

    List<FollowRequest> findByReceiverIdAndStatus(String receiverId, FollowStatus status);
}
