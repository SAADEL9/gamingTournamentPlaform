package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    Optional<Team> findByName(String name);

    java.util.List<Team> findByMembersContaining(String email);
}
