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
    private final com.saad.gamingtounament.repository.FriendshipRepository friendshipRepository;

    public FriendRequestServiceImpl(FriendRequestRepository friendRequestRepository,
            com.saad.gamingtounament.repository.UserRepository userRepository,
            com.saad.gamingtounament.repository.FriendshipRepository friendshipRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
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

        // Check if already friends
        boolean alreadyFriends = friendshipRepository.existsByUser1IdAndUser2Id(senderid, receiverid)
                || friendshipRepository.existsByUser1IdAndUser2Id(receiverid, senderid);
        if (alreadyFriends) {
            throw new IllegalStateException("You are already friends with this user.");
        }

        // Check if there's already a PENDING request
        boolean pendingExists = friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(senderid, receiverid,
                "PENDING")
                || friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(receiverid, senderid, "PENDING");

        if (pendingExists) {
            throw new IllegalStateException("A pending friend request already exists between these users.");
        }

        // If a REJECTED request exists, we might want to delete it or reuse it.
        // Let's delete any previously REJECTED or ACCEPTED requests to clean up before
        // creating a new PENDING one.
        // Actually, just delete the old ones if we are sending a new one.
        Optional<FriendRequest> existingRejectedBySender = friendRequestRepository
                .findBySenderIdAndReceiverIdAndStatus(senderid, receiverid, "REJECTED");
        existingRejectedBySender.ifPresent(friendRequestRepository::delete);

        Optional<FriendRequest> existingRejectedByReceiver = friendRequestRepository
                .findBySenderIdAndReceiverIdAndStatus(receiverid, senderid, "REJECTED");
        existingRejectedByReceiver.ifPresent(friendRequestRepository::delete);

        FriendRequest request = new FriendRequest();
        request.setSenderId(senderid);
        request.setReceiverId(receiverid);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDate.now());
        return friendRequestRepository.save(request);
    }

    @Override
    public List<com.saad.gamingtounament.dto.FriendRequestDTO> getAllRequestsByUser(String id) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverIdAndStatus(id, "PENDING");
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

    @Override
    public void acceptFriendRequest(String requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found."));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Friend request is not pending.");
        }

        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDate.now());
        friendRequestRepository.save(request);

        com.saad.gamingtounament.model.Friendship friendship = new com.saad.gamingtounament.model.Friendship();
        friendship.setUser1Id(request.getSenderId());
        friendship.setUser2Id(request.getReceiverId());
        friendship.setCreatedAt(LocalDate.now());
        friendshipRepository.save(friendship);
    }

    @Override
    public void rejectFriendRequest(String requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found."));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Friend request is not pending.");
        }

        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDate.now());
        friendRequestRepository.save(request);
    }
}
