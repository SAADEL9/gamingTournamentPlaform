package com.saad.gamingtounament.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account.path:}")
    private String serviceAccountPath;

    @PostConstruct
    public void initialize() {
        try {
            List<FirebaseApp> firebaseApps = FirebaseApp.getApps();
            if (firebaseApps == null || firebaseApps.isEmpty()) {
                FirebaseOptions options;

                try {
                    if (serviceAccountPath != null && !serviceAccountPath.isEmpty()) {
                        FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                                .build();
                    } else {
                        // Use default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.getApplicationDefault())
                                .build();
                    }

                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase application has been initialized");
                } catch (IOException e) {
                    System.err.println("WARNING: Failed to initialize Firebase. Authentication will not work. Error: "
                            + e.getMessage());
                    // Do not throw exception, allow app to start
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("WARNING: Unexpected error initializing Firebase. " + e.getMessage());
        }
    }
}
