package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "Friendship")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Friendship {
    @org.springframework.data.annotation.Id
    private String id;
    private String user1Id;
    private String user2Id;
    private LocalDate createdAt;
}
