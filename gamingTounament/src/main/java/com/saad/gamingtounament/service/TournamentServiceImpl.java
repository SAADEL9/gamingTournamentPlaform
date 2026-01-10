package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.model.Team;
import com.saad.gamingtounament.service.TeamService;
import com.saad.gamingtounament.service.TeamRequestService;
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
    private final TeamService teamService;
    private final TeamRequestService teamRequestService;

    @Autowired
    public TournamentServiceImpl(TournamentRepository tournamentRepository, TeamService teamService,
            TeamRequestService teamRequestService) {
        this.tournamentRepository = tournamentRepository;
        this.teamService = teamService;
        this.teamRequestService = teamRequestService;
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
                    throw new RuntimeException("You have already joined this tournament");
                }
            } else {
                // Team logic
                if (tournament.getTeams() == null) {
                    tournament.setTeams(new ArrayList<>());
                }

                // Check if current user is already in any team in THIS tournament
                boolean joined = tournament.getTeams().stream()
                        .filter(t -> t.getMembers() != null)
                        .anyMatch(t -> t.getMembers().contains(userEmail));

                if (!joined) {
                    if (tournament.getTeams().size() < tournament.getMaxPlayers()) {
                        // 1. Create the team with ONLY the captain
                        List<String> initialMembers = new ArrayList<>();
                        initialMembers.add(userEmail);

                        Team newTeam = teamService.createTeam(teamName, initialMembers);

                        // 2. Add the team to the tournament
                        tournament.getTeams().add(newTeam);

                        // 3. Send invitations to teammates
                        if (teammatesInput != null) {
                            for (String teammateEmail : teammatesInput) {
                                if (teammateEmail.equals(userEmail))
                                    continue; // Skip captain
                                try {
                                    teamRequestService.createTeamRequest(newTeam.getId(), userEmail, teammateEmail);
                                } catch (Exception e) {
                                    System.out.println("Could not invite " + teammateEmail + ": " + e.getMessage());
                                    // We continue for other potential teammates
                                }
                            }
                        }

                        if (tournament.getTeams().size() == tournament.getMaxPlayers()) {
                            tournament.setStatus("In Progress");
                        }

                        tournamentRepository.save(tournament);
                    } else {
                        throw new RuntimeException("Tournament is full");
                    }
                } else {
                    throw new RuntimeException("You are already in a team for this tournament.");
                }
            }
        } else {
            throw new RuntimeException("Tournament not found");
        }
    }
}