package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.service.TournamentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequestMapping("/api/tournament")
@RestController
public class TournamentController {
    @Autowired
    private TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<?> getAllTournaments() {
        try {
            List<Tournament> tournaments = tournamentService.allTournaments();
            return new ResponseEntity<>(tournaments, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error fetching tournaments: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/my-tournaments")
    public ResponseEntity<List<Tournament>> userTournaments(@RequestParam String userEmail) {
        return ResponseEntity.ok(tournamentService.getTournamentsByUser(userEmail));
    }

    @GetMapping("/{id}")
    public Optional<Tournament> getTournamentById(@PathVariable String id) {
        return new ResponseEntity<Optional<Tournament>>(tournamentService.singleTournament(id), HttpStatus.OK)
                .getBody();
    }

    @PostMapping("/create")
    public ResponseEntity<Tournament> createTournament(@RequestBody Tournament tournament) {
        return new ResponseEntity<>(tournamentService.createTournament(tournament), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Tournament> updateTournament(@PathVariable String id, @RequestBody Tournament tournament) {
        Tournament updatedTournament = tournamentService.updateTournament(id, tournament);
        if (updatedTournament != null) {
            return new ResponseEntity<>(updatedTournament, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTournament(@PathVariable String id) {
        tournamentService.deleteTournament(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinTournament(@PathVariable String id,
            @RequestBody java.util.Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String teamName = (String) payload.get("teamName");
            List<String> teammates = (List<String>) payload.get("teammates");

            System.out.println("Join request for tournament: " + id);
            System.out.println("Email: " + email);
            System.out.println("TeamName: " + teamName);
            System.out.println("Teammates: " + teammates);

            if (email == null) {
                return new ResponseEntity<>("Email required", HttpStatus.BAD_REQUEST);
            }
            tournamentService.joinTournament(id, email, teamName, teammates);
            return new ResponseEntity<>("Joined successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
