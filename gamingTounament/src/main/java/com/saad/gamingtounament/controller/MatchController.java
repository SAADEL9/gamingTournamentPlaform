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

    @PostMapping("/{matchId}/score")
    public ResponseEntity<Match> updateScore(
            @PathVariable String matchId,
            @RequestBody Map<String, Object> payload) {
        try {
            Integer score1 = (Integer) payload.get("score1");
            Integer score2 = (Integer) payload.get("score2");
            String submittedBy = (String) payload.get("submittedBy"); // Email

            if (score1 == null || score2 == null || submittedBy == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Match updatedMatch = matchService.updateMatchScore(matchId, score1, score2, submittedBy);
            return new ResponseEntity<>(updatedMatch, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{matchId}/confirm")
    public ResponseEntity<Match> confirmScore(
            @PathVariable String matchId,
            @RequestBody Map<String, String> payload) {
        try {
            String confirmedBy = payload.get("confirmedBy"); // Email

            if (confirmedBy == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Match updatedMatch = matchService.confirmMatchScore(matchId, confirmedBy);
            return new ResponseEntity<>(updatedMatch, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Match>> getMatchesByUser(@PathVariable String email) {
        try {
            List<Match> matches = matchService.getMatchesByUser(email);
            return new ResponseEntity<>(matches, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
