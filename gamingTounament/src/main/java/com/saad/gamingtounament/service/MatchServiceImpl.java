package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Match;
import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.MatchRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MatchServiceImpl implements MatchService {

    private static final String BYE = "BYE";

    @Autowired
    private MatchRepository matchRepository;

    @Override
    public List<Match> createMatches(Tournament tournament) {
        List<String> participants = new ArrayList<>(tournament.getParticipants());
        if (participants.size() < 2)
            return new ArrayList<>();

        Collections.shuffle(participants);
        int n = participants.size();

        // Calculate total rounds and matches needed for a power-of-2 bracket
        int totalRounds = (int) Math.ceil(Math.log(n) / Math.log(2));
        int totalBracketSize = (int) Math.pow(2, totalRounds);

        List<Match> allMatches = new ArrayList<>();
        List<List<Match>> rounds = new ArrayList<>();

        // 1. Create all matches for each round
        for (int r = 1; r <= totalRounds; r++) {
            int matchesInThisRound = totalBracketSize / (int) Math.pow(2, r);
            List<Match> roundMatches = new ArrayList<>();
            for (int i = 0; i < matchesInThisRound; i++) {
                Match match = new Match();
                match.setTournamentId(tournament.getId());
                match.setRound(r);
                match.setStatus("WAITING");
                roundMatches.add(match);
            }
            rounds.add(roundMatches);
        }

        // 2. Save all matches to get IDs and fill flat list
        for (List<Match> round : rounds) {
            for (Match m : round) {
                matchRepository.save(m);
                allMatches.add(m);
            }
        }

        // 3. Link matches across rounds using nextMatchId
        // rounds is 0-indexed (0=Round 1, 1=Round 2...)
        for (int r = 0; r < totalRounds - 1; r++) {
            List<Match> currentRound = rounds.get(r);
            List<Match> nextRound = rounds.get(r + 1);
            for (int i = 0; i < currentRound.size(); i++) {
                Match currentMatch = currentRound.get(i);
                // Parent match index is i / 2
                Match nextMatch = nextRound.get(i / 2);
                currentMatch.setNextMatchId(nextMatch.getId());
                matchRepository.save(currentMatch);
            }
        }

        // 4. Fill Round 1 with players and handle logic
        List<Match> firstRound = rounds.get(0);
        int pIndex = 0;

        for (Match m : firstRound) {
            String p1 = (pIndex < n) ? participants.get(pIndex++) : BYE;
            String p2 = (pIndex < n) ? participants.get(pIndex++) : BYE;

            m.setPlayer1Id(p1);
            m.setPlayer2Id(p2);

            processMatchOutcome(m);
        }

        return allMatches;
    }

    @Override
    public Match updateMatchScore(String matchId, Integer score1, Integer score2) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setScore1(score1);
        match.setScore2(score2);
        match.setStatus("COMPLETED");

        String winnerId = "";
        if (score1 > score2) {
            winnerId = match.getPlayer1Id();
        } else if (score1 < score2) {
            winnerId = match.getPlayer2Id();
        }
        match.setWinnerId(winnerId);
        matchRepository.save(match);

        // Advance winner to next match
        if (match.getNextMatchId() != null) {
            advanceWinner(match, winnerId);
        }

        return match;
    }

    @Override
    public List<Match> getMatchesByTournament(String tournamentId) {
        return matchRepository.findByTournamentId(tournamentId);
    }

    // Helper to determine match status and advance winner if applicable
    private void processMatchOutcome(Match match) {
        String p1 = match.getPlayer1Id();
        String p2 = match.getPlayer2Id();

        // If either is null, we are still waiting (should shouldn't happen during Round
        // 1 fill if we use BYE)
        if (p1 == null || p2 == null) {
            match.setStatus("WAITING");
            matchRepository.save(match);
            return;
        }

        boolean p1Bye = BYE.equals(p1);
        boolean p2Bye = BYE.equals(p2);

        if (!p1Bye && !p2Bye) {
            // Both real players -> Ready to play
            match.setStatus("PENDING");
            matchRepository.save(match);
        } else if (!p1Bye && p2Bye) {
            // P1 vs BYE -> P1 wins automatically
            match.setStatus("COMPLETED");
            match.setScore1(1);
            match.setScore2(0);
            match.setWinnerId(p1);
            matchRepository.save(match);
            advanceWinner(match, p1);
        } else if (p1Bye && !p2Bye) {
            // BYE vs P2 -> P2 wins automatically
            match.setStatus("COMPLETED");
            match.setScore1(0);
            match.setScore2(1);
            match.setWinnerId(p2);
            matchRepository.save(match);
            advanceWinner(match, p2);
        } else {
            // BYE vs BYE -> Double Bye (Void match) -> Winner is BYE
            match.setStatus("COMPLETED");
            match.setWinnerId(BYE);
            matchRepository.save(match);
            advanceWinner(match, BYE);
        }
    }

    // Helper to push a winner (or BYE) to the next match
    private void advanceWinner(Match currentMatch, String winnerId) {
        if (currentMatch.getNextMatchId() == null)
            return;

        Match nextMatch = matchRepository.findById(currentMatch.getNextMatchId())
                .orElse(null);

        if (nextMatch != null) {
            // Fill the first empty slot
            if (nextMatch.getPlayer1Id() == null) {
                nextMatch.setPlayer1Id(winnerId);
            } else if (nextMatch.getPlayer2Id() == null) {
                nextMatch.setPlayer2Id(winnerId);
            } else {
                // Both slots full or logic error. Assuming full.
            }
            matchRepository.save(nextMatch);

            // Now check if nextMatch is ready to process
            // Only process if both slots are filled
            if (nextMatch.getPlayer1Id() != null && nextMatch.getPlayer2Id() != null) {
                processMatchOutcome(nextMatch);
            }
        }
    }
}
