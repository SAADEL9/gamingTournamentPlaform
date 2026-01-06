package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Match;
import com.saad.gamingtounament.model.Tournament;

import java.util.List;

public interface MatchService {
    public List<Match> createMatches(Tournament tournament);

    public Match updateMatchScore(String matchId, Integer score1, Integer score2);

    public List<Match> getMatchesByTournament(String tournamentId);
}
