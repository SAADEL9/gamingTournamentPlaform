package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Match;
import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.MatchRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchServiceImpl implements MatchService {

    private static final String BYE = "BYE";

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private com.saad.gamingtounament.repository.UserRepository userRepository;

    @Autowired
    private com.saad.gamingtounament.repository.TournamentRepository tournamentRepository;

    @Override
    public List<Match> createMatches(Tournament tournament) {
        // Clear existing matches to avoid duplicates
        matchRepository.deleteByTournamentId(tournament.getId());

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

        for (List<Match> round : rounds) {
            for (Match m : round) {
                matchRepository.save(m);
                allMatches.add(m);
            }
        }

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
            m.setPlayer1Name(getPlayerName(p1));
            m.setPlayer2Id(p2);
            m.setPlayer2Name(getPlayerName(p2));

            processMatchOutcome(m);
        }

        return allMatches;
    }

    private String getPlayerName(String emailOrBye) {
        if (BYE.equals(emailOrBye))
            return BYE;
        return userRepository.findByEmail(emailOrBye)
                .map(com.saad.gamingtounament.model.User::getDisplayName)
                .orElse(emailOrBye);
    }

    @Override
    public Match updateMatchScore(String matchId, Integer score1, Integer score2, String submittedBy) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setScore1(score1);
        match.setScore2(score2);
        match.setScoreSubmittedBy(submittedBy);
        match.setConfirmed(false);
        match.setStatus("PENDING_CONFIRMATION");

        return matchRepository.save(match);
    }

    @Override
    public Match confirmMatchScore(String matchId, String confirmedBy) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!"PENDING_CONFIRMATION".equals(match.getStatus())) {
            throw new RuntimeException("Match is not waiting for confirmation");
        }

        // Ensure confirm is done by the OTHER player
        // (In a real app, strict checks. Here just assume controller validated access
        // or check simply)
        if (confirmedBy.equals(match.getScoreSubmittedBy())) {
            throw new RuntimeException("You cannot confirm your own submission.");
        }

        match.setConfirmed(true);
        match.setStatus("COMPLETED");

        Integer score1 = match.getScore1();
        Integer score2 = match.getScore2();

        String winnerId = "";
        String winnerName = "";
        if (score1 > score2) {
            winnerId = match.getPlayer1Id();
            winnerName = match.getPlayer1Name();
        } else if (score1 < score2) {
            winnerId = match.getPlayer2Id();
            winnerName = match.getPlayer2Name();
        }
        match.setWinnerId(winnerId);
        match.setWinnerName(winnerName);
        matchRepository.save(match);

        // Advance winner to next match
        if (match.getNextMatchId() != null) {
            advanceWinner(match, winnerId, winnerName);
        } else {
            // Tournament ends here (Final Match)
            if (!BYE.equals(winnerId)) {
                Tournament t = tournamentRepository.findById(match.getTournamentId()).orElse(null);
                if (t != null) {
                    t.setWinnerId(winnerId);
                    t.setWinnerName(winnerName);
                    t.setStatus("COMPLETED");
                    tournamentRepository.save(t);
                }
            }
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
            match.setWinnerName(match.getPlayer1Name());
            matchRepository.save(match);
            advanceWinner(match, p1, match.getPlayer1Name());
        } else if (p1Bye && !p2Bye) {
            // BYE vs P2 -> P2 wins automatically
            match.setStatus("COMPLETED");
            match.setScore1(0);
            match.setScore2(1);
            match.setWinnerId(p2);
            match.setWinnerName(match.getPlayer2Name());
            matchRepository.save(match);
            advanceWinner(match, p2, match.getPlayer2Name());
        } else {
            // BYE vs BYE -> Double Bye (Void match) -> Winner is BYE
            match.setStatus("COMPLETED");
            match.setWinnerId(BYE);
            match.setWinnerName(BYE);
            matchRepository.save(match);
            advanceWinner(match, BYE, BYE);
        }
    }

    private void advanceWinner(Match currentMatch, String winnerId, String winnerName) {
        if (currentMatch.getNextMatchId() == null)
            return;

        Match nextMatch = matchRepository.findById(currentMatch.getNextMatchId())
                .orElse(null);

        if (nextMatch != null) {

            if (nextMatch.getPlayer1Id() == null) {
                nextMatch.setPlayer1Id(winnerId);
                nextMatch.setPlayer1Name(winnerName);
            } else if (nextMatch.getPlayer2Id() == null) {
                nextMatch.setPlayer2Id(winnerId);
                nextMatch.setPlayer2Name(winnerName);
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

    @Override
    public List<Match> getMatchesByUser(String email) {
        // This is not the most efficient way (fetching all matches),
        // but given the scale and existing repository methods, it works without adding
        // custom queries to the repository yet.
        return matchRepository.findAll().stream()
                .filter(m -> email.equals(m.getPlayer1Id()) || email.equals(m.getPlayer2Id()))
                .collect(Collectors.toList());
    }
}
