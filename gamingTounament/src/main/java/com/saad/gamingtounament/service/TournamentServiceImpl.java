package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

// This is the actual service component, marked with @Service
@Service
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;

    @Autowired
    public TournamentServiceImpl(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
        System.out.println("TournamentService initialized.");
    }

    @Override
    public List<Tournament> allTournaments() {
        return tournamentRepository.findAll();
    }
    @Override
    public List<Tournament> getTournamentsByUser(String userEmail) {
        return allTournaments().stream()
                .filter(t -> {
                    boolean inParticipants = t.getParticipants() != null && t.getParticipants().contains(userEmail);
                    boolean inTeams = t.getTeams() != null && t.getTeams().stream()
                            .anyMatch(team -> team.getMembers() != null && team.getMembers().contains(userEmail));
                    return inParticipants || inTeams;
                })
                .collect(Collectors.toList());
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

    @Override
    public void joinTournament(String tournamentId, String userEmail, String teamName, List<String> teammatesInput) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
        if (tournamentOpt.isPresent()) {
            Tournament tournament = tournamentOpt.get();

            // Check if 1v1 (teamSize = 1)
            if (tournament.getTeamSize() <= 1) {
                if (tournament.getParticipants() == null) {
                    tournament.setParticipants(new ArrayList<>());
                }
                if (!tournament.getParticipants().contains(userEmail)) {
                    if (tournament.getParticipants().size() < tournament.getMaxPlayers()) {
                        tournament.getParticipants().add(userEmail);
                        if (tournament.getParticipants().size() == tournament.getMaxPlayers()) {
                            tournament.setStatus("In Progress");
                        }
                        tournamentRepository.save(tournament);
                    } else {
                        throw new RuntimeException("Tournament is full");
                    }
                } else {
                    // User already joined, do nothing or throw?
                    // If returning void, maybe throw to inform user.
                    throw new RuntimeException("You have already joined this tournament");
                }
            } else {
                // Team logic
                if (tournament.getTeams() == null) {
                    tournament.setTeams(new ArrayList<>());
                }

                // Check if current user is already in any team
                boolean joined = tournament.getTeams().stream()
                        .filter(t -> t.getMembers() != null)
                        .anyMatch(t -> t.getMembers().contains(userEmail));

                if (!joined) {
                    if (tournament.getTeams().size() < tournament.getMaxPlayers()) {
                        // Ensure teammates list is mutable and handles input
                        List<String> finalTeammates = new ArrayList<>();
                        if (teammatesInput != null) {
                            finalTeammates.addAll(teammatesInput);
                        }

                        // Add captain if not already present (though frontend usually excludes captain)
                        if (!finalTeammates.contains(userEmail)) {
                            finalTeammates.add(userEmail);
                        }

                        // Validate team size
                        if (finalTeammates.size() != tournament.getTeamSize()) {
                            throw new RuntimeException(
                                    "Team size must be " + tournament.getTeamSize() + ". You have "
                                            + finalTeammates.size() + " members (including yourself).");
                        }

                        com.saad.gamingtounament.model.Team newTeam = new com.saad.gamingtounament.model.Team(teamName,
                                finalTeammates);
                        tournament.getTeams().add(newTeam);

                        if (tournament.getTeams().size() == tournament.getMaxPlayers()) {
                            tournament.setStatus("In Progress");
                        }

                        tournamentRepository.save(tournament);
                    } else {
                        throw new RuntimeException("Tournament is full");
                    }
                } else {
                    throw new RuntimeException("You are already in a team");
                }
            }
        } else {
            throw new RuntimeException("Tournament not found");
        }
    }
}