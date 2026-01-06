package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String tournamentId;
    private int round;
    private String player1Id;
    private String player2Id;
    private Integer score1;
    private Integer score2;
    private String winnerId;
    private String status; // PENDING, IN_PROGRESS, COMPLETED
    private String nextMatchId;
}
