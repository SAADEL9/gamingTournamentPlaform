package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.User;
import com.saad.gamingtounament.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FirebaseAuthService firebaseAuthService;

    public User loginUser(String token) throws FirebaseAuthException {
        FirebaseToken decodedToken = firebaseAuthService.verifyToken(token);
        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();
        String name = decodedToken.getName();
        String picture = decodedToken.getPicture();

        Optional<User> existingUser = userRepository.findByFirebaseUid(uid);
        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setFirebaseUid(uid);
            newUser.setEmail(email);
            newUser.setDisplayName(name);
            newUser.setPhotoUrl(picture);
            newUser.setTeammates(new ArrayList<>());
            newUser.setCreatedAt(new java.util.Date());
            return userRepository.save(newUser);
        }
    }

    public User getOrCreateUser(String email, String displayName, String photoUrl, String firebaseUid) {
        System.out.println("DEBUG: Syncing user " + email + " with UID: " + firebaseUid);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            System.out.println("DEBUG: User exists, updating.");
            User user = userOpt.get();
            // Update fields if changed
            if (firebaseUid != null && !firebaseUid.equals(user.getFirebaseUid())) {
                System.out.println("DEBUG: Updating missing/changed Firebase UID for " + email);
                user.setFirebaseUid(firebaseUid);
                return userRepository.save(user);
            }
            return user;
        } else {
            System.out.println("DEBUG: Creating NEW user for " + email);
            User newUser = new User(email, displayName, photoUrl);
            newUser.setFirebaseUid(firebaseUid); // Set the UID
            User savedUser = userRepository.save(newUser);
            System.out.println("DEBUG: Saved user ID: " + savedUser.getId());
            return savedUser;
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

    public List<User> searchUsers(String query) {
        System.out.println("DEBUG: Searching for '" + query + "'");
        System.out.println("DEBUG: Total users in DB: " + userRepository.count());
        List<User> byName = userRepository.findByDisplayNameContainingIgnoreCase(query);
        List<User> byEmail = userRepository.findByEmailContainingIgnoreCase(query);

        List<User> results = new ArrayList<>(byName);
        for (User user : byEmail) {
            if (!results.contains(user)) {
                results.add(user);
            }
        }
        return results;
    }
}
