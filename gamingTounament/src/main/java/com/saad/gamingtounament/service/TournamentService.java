package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import java.util.List;
import java.util.Optional;

// This defines the contract for the service. No implementation here.
public interface TournamentService {
    List<Tournament> allTournaments();
    List<Tournament> getTournamentsByUser(String userEmail);

    Optional<Tournament> singleTournament(String id);

    public Tournament createTournament(Tournament tournament);

    public Tournament updateTournament(String id, Tournament tournament);

    public void deleteTournament(String id);

    public void joinTournament(String tournamentId, String userEmail, String teamName, List<String> teammates);
}