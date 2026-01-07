package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.model.Tournament;
import com.saad.gamingtounament.repository.FriendRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface FriendRequestService {

    public Optional<FriendRequest> findRequestById(String id);

    public FriendRequest createFriendRequest(String senderid, String receiverid);

    public List<com.saad.gamingtounament.dto.FriendRequestDTO> getAllRequestsByUser(String id);

}
