package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Team;
import com.saad.gamingtounament.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;

    public TeamServiceImpl(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Override
    public Team createTeam(String name, List<String> memberEmails) {
        if (teamRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Team with this name already exists.");
        }
        Team team = new Team();
        team.setName(name);
        team.setMembers(memberEmails != null ? memberEmails : new ArrayList<>());
        return teamRepository.save(team);
    }

    @Override
    public Optional<Team> getTeamById(String id) {
        return teamRepository.findById(id);
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Override
    public List<Team> getTeamsByMemberEmail(String email) {
        return teamRepository.findByMembersContaining(email);
    }

    @Override
    public Team addMember(String teamId, String memberEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        if (team.getMembers().contains(memberEmail)) {
            throw new IllegalArgumentException("User is already a member of this team.");
        }

        team.getMembers().add(memberEmail);
        return teamRepository.save(team);
    }

    @Override
    public Team removeMember(String teamId, String memberEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        team.getMembers().remove(memberEmail);
        return teamRepository.save(team);
    }

    @Override
    public void deleteTeam(String id) {
        teamRepository.deleteById(id);
    }
}
