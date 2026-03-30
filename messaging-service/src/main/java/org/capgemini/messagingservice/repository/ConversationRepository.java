package org.capgemini.messagingservice.repository;

import org.capgemini.messagingservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByParticipant1AndParticipant2(String p1, String p2);
}
