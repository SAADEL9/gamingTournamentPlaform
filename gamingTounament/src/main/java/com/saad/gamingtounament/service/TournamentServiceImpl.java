package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.TournamentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// This is the actual service component, marked with @Service
@Service
public class TournamentServiceImpl implements TournamentService {


    private final TournamentRepository tournamentRepository;


    @Autowired
    public TournamentServiceImpl(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
    }


    @Override
    public List<Tournament> allTournaments() {
        return tournamentRepository.findAll();
    }



    @Override
    public Optional<Tournament> singleTournament(ObjectId id) {
        return tournamentRepository.findById(id);

    }
    @Override
    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }
}