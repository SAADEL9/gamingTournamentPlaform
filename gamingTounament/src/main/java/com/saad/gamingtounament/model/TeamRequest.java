package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "TeamRequest")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamRequest {
    @Id
    private String id;
    private String teamId;
    private String teamName;
    private String senderEmail;
    private String receiverEmail;
    private String status; // PENDING, ACCEPTED, REJECTED
}
