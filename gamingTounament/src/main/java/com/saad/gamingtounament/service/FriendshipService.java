package com.saad.gamingtounament.service;

import org.springframework.stereotype.Service;

import java.util.List;

public interface FriendshipService {
    List<com.saad.gamingtounament.model.User> getFriends(String userId);

    void removeFriend(String userId, String friendId);
}
