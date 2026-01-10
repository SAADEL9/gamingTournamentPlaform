package com.saad.gamingtounament.service;

import com.saad.gamingtounament.model.Friendship;
import com.saad.gamingtounament.model.User;
import com.saad.gamingtounament.repository.FriendshipRepository;
import com.saad.gamingtounament.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendshipServiceImpl(FriendshipRepository friendshipRepository, UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getFriends(String userId) {
        List<Friendship> friendships = friendshipRepository.findByUser1IdOrUser2Id(userId, userId);
        List<String> friendIds = friendships.stream()
                .map(f -> f.getUser1Id().equals(userId) ? f.getUser2Id() : f.getUser1Id())
                .collect(Collectors.toList());

        List<User> friends = new ArrayList<>();
        for (String friendId : friendIds) {
            userRepository.findByFirebaseUid(friendId).ifPresent(friends::add);
        }
        return friends;
    }

    @Override
    public void removeFriend(String userId, String friendId) {
        System.out.println("Removing friendship between " + userId + " and " + friendId);
        friendshipRepository.deleteByUser1IdAndUser2Id(userId, friendId);
        friendshipRepository.deleteByUser2IdAndUser1Id(userId, friendId);
    }
}
