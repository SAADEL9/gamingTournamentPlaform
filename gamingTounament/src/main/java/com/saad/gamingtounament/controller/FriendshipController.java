package com.saad.gamingtounament.controller;

import org.springframework.web.bind.annotation.RestController;

import com.saad.gamingtounament.model.User;
import com.saad.gamingtounament.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friendship")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @GetMapping("/list/{userId}")
    public ResponseEntity<List<User>> getFriends(@PathVariable String userId) {
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @DeleteMapping("/remove/{userId}/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable String userId, @PathVariable String friendId) {
        friendshipService.removeFriend(userId, friendId);
        return ResponseEntity.noContent().build();
    }
}
