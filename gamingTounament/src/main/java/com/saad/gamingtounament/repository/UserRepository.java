package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByFirebaseUid(String firebaseUid);

    List<User> findByDisplayNameContainingIgnoreCase(String displayName);

    List<User> findByEmailContainingIgnoreCase(String email);
}
