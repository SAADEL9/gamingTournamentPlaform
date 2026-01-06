package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.Match;
import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.service.MatchService;
import com.saad.gamingtounament.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(originPatterns = "*")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private TournamentService tournamentService;

    /**
     * Generate bracket for a tournament
     * POST /api/matches/generate/{tournamentId}
     */
    @PostMapping("/generate/{tournamentId}")
    public ResponseEntity<List<Match>> generateBracket(@PathVariable String tournamentId) {
        try {
            Tournament tournament = tournamentService.singleTournament(tournamentId)
                    .orElse(null);
            if (tournament == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            List<Match> matches = matchService.createMatches(tournament);
            return new ResponseEntity<>(matches, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all matches for a tournament
     * GET /api/matches/tournament/{tournamentId}
     */
    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<Match>> getMatchesByTournament(@PathVariable String tournamentId) {
        try {
            List<Match> matches = matchService.getMatchesByTournament(tournamentId);
            return new ResponseEntity<>(matches, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update match score
     * POST /api/matches/{matchId}/score
     * Body: { "score1": 10, "score2": 5 }
     */
    @PostMapping("/{matchId}/score")
    public ResponseEntity<Match> updateScore(
            @PathVariable String matchId,
            @RequestBody Map<String, Integer> scores) {
        try {
            Integer score1 = scores.get("score1");
            Integer score2 = scores.get("score2");

            if (score1 == null || score2 == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Match updatedMatch = matchService.updateMatchScore(matchId, score1, score2);
            return new ResponseEntity<>(updatedMatch, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
