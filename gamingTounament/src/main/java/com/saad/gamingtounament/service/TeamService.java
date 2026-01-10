package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Team;
import java.util.List;
import java.util.Optional;

public interface TeamService {
    Team createTeam(String name, List<String> memberEmails);

    Optional<Team> getTeamById(String id);

    List<Team> getAllTeams();

    List<Team> getTeamsByMemberEmail(String email);

    Team addMember(String teamId, String memberEmail);

    Team removeMember(String teamId, String memberEmail);

    void deleteTeam(String id);
}
