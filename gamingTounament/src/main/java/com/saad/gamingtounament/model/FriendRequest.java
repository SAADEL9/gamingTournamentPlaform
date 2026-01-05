package com.saad.gamingtounament.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
@Document(collection = "FriendRequest")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FriendRequest {
    private String id;
    private String  senderId;
    private String  receiverId;
    private String  status;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
