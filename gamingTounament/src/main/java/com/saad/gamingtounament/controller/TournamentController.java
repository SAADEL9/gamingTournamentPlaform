package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.service.TournamentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.util.List;
import java.util.Optional;

@RequestMapping("/api/tournament")
@RestController
public class TournamentController {
    @Autowired
    private TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return new ResponseEntity<List<Tournament>>(tournamentService.allTournaments(), HttpStatus.OK);
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
}
