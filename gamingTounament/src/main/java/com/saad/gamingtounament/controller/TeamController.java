package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.Team;
import com.saad.gamingtounament.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @PostMapping("/create")
    public ResponseEntity<Team> createTeam(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        @SuppressWarnings("unchecked")
        List<String> members = (List<String>) payload.get("members");

        if (name == null || name.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(teamService.createTeam(name, members), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable String id) {
        return teamService.getTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/my-team/{email}")
    public ResponseEntity<Team> getMyTeam(@PathVariable String email) {
        List<Team> teams = teamService.getTeamsByMemberEmail(email);
        if (teams.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Return the most recent team (last in the list assuming natural order)
        return ResponseEntity.ok(teams.get(teams.size() - 1));
    }

    @PostMapping("/{teamId}/add-member")
    public ResponseEntity<Team> addMember(@PathVariable String teamId, @RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(teamService.addMember(teamId, email));
    }

    @DeleteMapping("/{teamId}/remove-member/{email}")
    public ResponseEntity<Team> removeMember(@PathVariable String teamId, @PathVariable String email) {
        return ResponseEntity.ok(teamService.removeMember(teamId, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }
}
