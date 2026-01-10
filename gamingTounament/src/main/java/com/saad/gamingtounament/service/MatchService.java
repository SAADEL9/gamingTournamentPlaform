package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Match;
import com.saad.gamingtounament.model.Tournament;

import java.util.List;

public interface MatchService {
    public List<Match> createMatches(Tournament tournament);

    public Match updateMatchScore(String matchId, Integer score1, Integer score2, String submittedBy);

    public Match confirmMatchScore(String matchId, String confirmedBy);

    public List<Match> getMatchesByTournament(String tournamentId);

    public List<Match> getMatchesByUser(String email);
}
