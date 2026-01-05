package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import org.springframework.data.mongodb.core.index.Indexed;

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

    @Indexed(unique = true)
    private String firebaseUid;

    private Date createdAt;

    private List<String> teammates; // Emails of teammates

    public User(String email, String displayName, String photoUrl) {
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
        this.teammates = new ArrayList<>();
    }
}
