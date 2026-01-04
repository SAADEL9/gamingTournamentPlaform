package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Team {
    private String name;
    private List<String> members; // List of user emails
}
