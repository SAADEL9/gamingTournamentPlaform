package com.saad.gamingtounament.controller;

import com.saad.gamingtounament.model.User;
import com.saad.gamingtounament.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String displayName = payload.get("displayName");
        String photoUrl = payload.get("photoUrl");
        return new ResponseEntity<>(userService.getOrCreateUser(email, displayName, photoUrl), HttpStatus.OK);
    }

    @GetMapping("/{email}")
    public ResponseEntity<User> getUser(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return user != null ? new ResponseEntity<>(user, HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/teammate/add")
    public ResponseEntity<String> addTeammate(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("userEmail");
        String teammateEmail = payload.get("teammateEmail");
        userService.addTeammate(userEmail, teammateEmail);
        return new ResponseEntity<>("Teammate added", HttpStatus.OK);
    }

    @PostMapping("/teammate/remove")
    public ResponseEntity<String> removeTeammate(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("userEmail");
        String teammateEmail = payload.get("teammateEmail");
        userService.removeTeammate(userEmail, teammateEmail);
        return new ResponseEntity<>("Teammate removed", HttpStatus.OK);
    }
}
