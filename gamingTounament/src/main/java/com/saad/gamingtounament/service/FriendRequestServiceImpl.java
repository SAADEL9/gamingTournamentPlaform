package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.repository.FriendRequestRepository;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FriendRequestServiceImpl implements FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final com.saad.gamingtounament.repository.UserRepository userRepository;

    public FriendRequestServiceImpl(FriendRequestRepository friendRequestRepository,
            com.saad.gamingtounament.repository.UserRepository userRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Optional<FriendRequest> findRequestById(String id) {
        return friendRequestRepository.findById(id);
    }

    @Override
    public FriendRequest createFriendRequest(String senderid, String receiverid) {
        if (senderid.equals(receiverid)) {
            throw new IllegalArgumentException("Cannot send a friend request to yourself.");
        }

        boolean exists = friendRequestRepository.existsBySenderIdAndReceiverId(senderid, receiverid)
                || friendRequestRepository.existsBySenderIdAndReceiverId(receiverid, senderid);
        if (exists) {
            throw new IllegalStateException("Friend request already exists between these users.");
        }

        FriendRequest request = new FriendRequest();
        request.setSenderId(senderid);
        request.setReceiverId(receiverid);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDate.now());
        return friendRequestRepository.save(request);
    }

    @Override
    public List<com.saad.gamingtounament.dto.FriendRequestDTO> getAllRequestsByUser(String id) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverId(id);
        List<com.saad.gamingtounament.dto.FriendRequestDTO> dtos = new ArrayList<>();

        for (FriendRequest request : requests) {
            com.saad.gamingtounament.model.User sender = userRepository.findByFirebaseUid(request.getSenderId())
                    .orElse(null);
            com.saad.gamingtounament.dto.FriendRequestDTO dto = new com.saad.gamingtounament.dto.FriendRequestDTO(
                    request.getId(),
                    request.getSenderId(),
                    sender != null ? sender.getDisplayName() : "Unknown",
                    sender != null ? sender.getEmail() : "",
                    sender != null ? sender.getPhotoUrl() : "",
                    request.getStatus(),
                    request.getCreatedAt());
            dtos.add(dto);
        }
        return dtos;
    }
}
