package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private String id;
    private String email;
    private String displayName;
    private String photoUrl;
    private List<String> teammates; // Emails of teammates

    public User(String email, String displayName, String photoUrl) {
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
        this.teammates = new ArrayList<>();
    }
}
