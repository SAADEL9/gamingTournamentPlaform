package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;

// This defines the contract for the service. No implementation here.
public interface TournamentService {
    List<Tournament> allTournaments();


    Optional<Tournament> singleTournament(ObjectId id);

    public Tournament createTournament(Tournament tournament);
}