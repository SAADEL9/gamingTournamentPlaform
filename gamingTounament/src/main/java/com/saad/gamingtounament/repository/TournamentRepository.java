package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.Tournament;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TournamentRepository extends MongoRepository<Tournament, String> {

}