package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.TeamRequest;
import com.saad.gamingtounament.service.TeamRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team-request")
public class TeamRequestController {

    @Autowired
    private TeamRequestService teamRequestService;

    @PostMapping("/create")
    public ResponseEntity<TeamRequest> createRequest(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(teamRequestService.createTeamRequest(
                payload.get("teamId"),
                payload.get("senderEmail"),
                payload.get("receiverEmail")));
    }

    @GetMapping("/list/{email}")
    public ResponseEntity<List<TeamRequest>> getRequests(@PathVariable String email) {
        return ResponseEntity.ok(teamRequestService.getRequestsForUser(email));
    }

    @PostMapping("/accept/{id}")
    public ResponseEntity<Void> acceptRequest(@PathVariable String id) {
        teamRequestService.acceptRequest(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> rejectRequest(@PathVariable String id) {
        teamRequestService.rejectRequest(id);
        return ResponseEntity.ok().build();
    }
}
