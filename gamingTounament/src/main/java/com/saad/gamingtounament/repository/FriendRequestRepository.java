package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {
    boolean existsBySenderIdAndReceiverId(String senderUid, String receiverUid);

    List<FriendRequest> findByReceiverId(String receiverId);
}
