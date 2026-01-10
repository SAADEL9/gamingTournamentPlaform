package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.model.Friendship;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendshipRepository extends MongoRepository<Friendship, String> {
    java.util.List<Friendship> findByUser1IdOrUser2Id(String user1Id, String user2Id);

    boolean existsByUser1IdAndUser2Id(String user1Id, String user2Id);

    void deleteByUser1IdAndUser2Id(String user1Id, String user2Id);

    void deleteByUser2IdAndUser1Id(String user1Id, String user2Id);
}
