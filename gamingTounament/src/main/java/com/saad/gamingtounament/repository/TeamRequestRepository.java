package com.saad.gamingtounament.repository;

import com.saad.gamingtounament.model.TeamRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRequestRepository extends MongoRepository<TeamRequest, String> {
    List<TeamRequest> findByReceiverEmailAndStatus(String email, String status);

    List<TeamRequest> findByTeamIdAndReceiverEmail(String teamId, String receiverEmail);
}
