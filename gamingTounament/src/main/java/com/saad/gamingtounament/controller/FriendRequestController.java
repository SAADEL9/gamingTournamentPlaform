package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.service.FriendRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/friend-request")
@RestController
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @PostMapping("/create")
    public ResponseEntity<FriendRequest> createRequest(
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> payload) {
        String senderid = payload.get("senderid");
        String receiverid = payload.get("receiverid");

        if (senderid == null || senderid.trim().isEmpty() || receiverid == null || receiverid.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<FriendRequest>(friendRequestService.createFriendRequest(senderid, receiverid),
                HttpStatus.CREATED);

    }

    @GetMapping("/list/{userId}")
    public ResponseEntity<java.util.List<com.saad.gamingtounament.dto.FriendRequestDTO>> getRequestsByUser(
            @org.springframework.web.bind.annotation.PathVariable String userId) {
        return new ResponseEntity<>(friendRequestService.getAllRequestsByUser(userId), HttpStatus.OK);
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptRequest(@org.springframework.web.bind.annotation.PathVariable String requestId) {
        friendRequestService.acceptFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<Void> rejectRequest(@org.springframework.web.bind.annotation.PathVariable String requestId) {
        friendRequestService.rejectFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }
}
