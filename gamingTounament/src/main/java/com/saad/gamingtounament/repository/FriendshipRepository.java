package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.model.Friendship;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendshipRepository  extends MongoRepository<Friendship, String> {
}
