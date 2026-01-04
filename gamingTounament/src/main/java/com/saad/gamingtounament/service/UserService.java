package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.User;
import com.saad.gamingtounament.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User getOrCreateUser(String email, String displayName, String photoUrl) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            User newUser = new User(email, displayName, photoUrl);
            return userRepository.save(newUser);
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public void addTeammate(String userEmail, String teammateEmail) {
        User user = getUserByEmail(userEmail);
        if (user != null) {
            if (user.getTeammates() == null) {
                user.setTeammates(new ArrayList<>());
            }
            if (!user.getTeammates().contains(teammateEmail)) {
                user.getTeammates().add(teammateEmail);
                userRepository.save(user);
            }
        }
    }

    public void removeTeammate(String userEmail, String teammateEmail) {
        User user = getUserByEmail(userEmail);
        if (user != null && user.getTeammates() != null) {
            user.getTeammates().remove(teammateEmail);
            userRepository.save(user);
        }
    }
}
