package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.TournamentRepository;
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
    public Optional<Tournament> singleTournament(String id) {
        return tournamentRepository.findById(id);

    }

    @Override
    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    @Override
    public Tournament updateTournament(String id, Tournament tournament) {
        Optional<Tournament> existingTournamentOptional = tournamentRepository.findById(id);
        if (existingTournamentOptional.isPresent()) {
            Tournament existingTournament = existingTournamentOptional.get();
            existingTournament.setName(tournament.getName());
            existingTournament.setGame(tournament.getGame());
            existingTournament.setStartTime(tournament.getStartTime());
            existingTournament.setMaxPlayers(tournament.getMaxPlayers());
            existingTournament.setEntryFee(tournament.getEntryFee());
            existingTournament.setPrize(tournament.getPrize());
            existingTournament.setStatus(tournament.getStatus());
            return tournamentRepository.save(existingTournament);
        } else {
            return null; // Or throw exception
        }
    }

    @Override
    public void deleteTournament(String id) {
        tournamentRepository.deleteById(id);
    }
}