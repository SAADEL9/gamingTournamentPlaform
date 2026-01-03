package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

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

    public Tournament(String name, String game, LocalDateTime startTime, int maxPlayers, int entryFee, String prize,
            String status) {
        this.name = name;
        this.game = game;
        this.startTime = startTime;
        this.maxPlayers = maxPlayers;
        this.entryFee = entryFee;
        this.prize = prize;
        this.status = status;
    }
}
