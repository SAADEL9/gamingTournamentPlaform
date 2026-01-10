package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {
    boolean existsBySenderIdAndReceiverId(String senderUid, String receiverUid);

    boolean existsBySenderIdAndReceiverIdAndStatus(String senderId, String receiverId, String status);

    List<FriendRequest> findByReceiverId(String receiverId);

    List<FriendRequest> findByReceiverIdAndStatus(String receiverId, String status);

    Optional<FriendRequest> findBySenderIdAndReceiverIdAndStatus(String senderId, String receiverId, String status);
}
