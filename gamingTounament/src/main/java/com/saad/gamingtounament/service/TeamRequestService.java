package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Team;
import com.saad.gamingtounament.model.TeamRequest;
import com.saad.gamingtounament.repository.TeamRepository;
import com.saad.gamingtounament.repository.TeamRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamRequestService {

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private TeamRepository teamRepository;

    public TeamRequest createTeamRequest(String teamId, String senderEmail, String receiverEmail) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if already in team
        if (team.getMembers().contains(receiverEmail)) {
            throw new RuntimeException("User is already in the team");
        }

        // Check if a pending request already exists
        List<TeamRequest> existing = teamRequestRepository.findByTeamIdAndReceiverEmail(teamId, receiverEmail);
        for (TeamRequest req : existing) {
            if ("PENDING".equals(req.getStatus())) {
                return req;
            }
        }

        TeamRequest request = new TeamRequest();
        request.setTeamId(teamId);
        request.setTeamName(team.getName());
        request.setSenderEmail(senderEmail);
        request.setReceiverEmail(receiverEmail);
        request.setStatus("PENDING");
        return teamRequestRepository.save(request);
    }

    public List<TeamRequest> getRequestsForUser(String email) {
        return teamRequestRepository.findByReceiverEmailAndStatus(email, "PENDING");
    }

    public void acceptRequest(String requestId) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getMembers().contains(request.getReceiverEmail())) {
            team.getMembers().add(request.getReceiverEmail());
            teamRepository.save(team);
        }

        request.setStatus("ACCEPTED");
        teamRequestRepository.save(request);
    }

    public void rejectRequest(String requestId) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("REJECTED");
        teamRequestRepository.save(request);
    }
}
