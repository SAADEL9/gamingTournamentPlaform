package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "tournaments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Tournament {
    @Id
    private String id;
    private String name;
    private String game;
    private LocalDateTime startTime;
    private int maxPlayers;
    private int entryFee;
    private String prize;
    private String status;
    private List<String> participants; // For 1v1 legacy or simple usage

    private int teamSize = 1; // 1 = 1v1, 2 = 2v2, etc.
    private List<Team> teams;

    public Tournament(String name, String game, LocalDateTime startTime, int maxPlayers, int entryFee, String prize,
            String status) {
        this.name = name;
        this.game = game;
        this.startTime = startTime;
        this.maxPlayers = maxPlayers;
        this.entryFee = entryFee;
        this.prize = prize;
        this.status = status;
        this.participants = new ArrayList<>();
        this.teams = new ArrayList<>();
    }
}
