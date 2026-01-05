package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.service.FriendRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RequestMapping("/api/friend-request")
@RestController
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @GetMapping("/create")
    public ResponseEntity<FriendRequest> createRequest(String senderid, String receiverid )
    {
        return new ResponseEntity<FriendRequest>(friendRequestService.createFriendRequest(senderid, receiverid), HttpStatus.CREATED);

    }
}
