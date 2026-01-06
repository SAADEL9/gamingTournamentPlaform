package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.repository.FriendRequestRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class FriendRequestServiceImpl implements FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;

    public FriendRequestServiceImpl(FriendRequestRepository friendRequestRepository) {
        this.friendRequestRepository = friendRequestRepository;
    }

    @Override
    public Optional<FriendRequest> findRequestById(String id) {
        return friendRequestRepository.findById(id);
    }

    @Override
    public FriendRequest createFriendRequest(String senderid, String receiverid) {
        // Validation: no self-request
        if (senderid.equals(receiverid)) {
            throw new IllegalArgumentException("Cannot send a friend request to yourself.");
        }

        // Validation: check if request already exists (sender → receiver OR receiver →
        // sender)
        boolean exists = friendRequestRepository.existsBySenderIdAndReceiverId(senderid, receiverid)
                || friendRequestRepository.existsBySenderIdAndReceiverId(receiverid, senderid);
        if (exists) {
            throw new IllegalStateException("Friend request already exists between these users.");
        }

        // Build FriendRequest object
        FriendRequest request = new FriendRequest();
        request.setSenderId(senderid);
        request.setReceiverId(receiverid);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDate.now());

        // Save to MongoDB
        return friendRequestRepository.save(request);
    }
}
