package com.saad.gamingtounament.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthService {

    public FirebaseToken verifyToken(String token) throws FirebaseAuthException {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }
}
