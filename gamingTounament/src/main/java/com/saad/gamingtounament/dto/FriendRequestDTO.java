package com.saad.gamingtounament.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FriendRequestDTO {
    private String id;
    private String senderId;
    private String senderName;
    private String senderEmail;
    private String senderPhotoUrl;
    private String status;
    private LocalDate createdAt;
}
