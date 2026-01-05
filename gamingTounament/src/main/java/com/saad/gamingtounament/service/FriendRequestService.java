package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.FriendRequest;
import com.saad.gamingtounament.repository.FriendRequestRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;


public interface FriendRequestService {



    public Optional<FriendRequest> findRequestById(String id);
    public FriendRequest createFriendRequest(String senderid, String receiverid) ;

}
