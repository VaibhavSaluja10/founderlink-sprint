package org.capgemini.messagingservice.controller;

import org.capgemini.messagingservice.dto.MessageDto;
import org.capgemini.messagingservice.entity.Message;
import org.capgemini.messagingservice.repository.ConversationRepository;
import org.capgemini.messagingservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDto dto, Authentication authentication) {
        return conversationRepository.findById(dto.getConversationId()).map(conv -> {
            String sender = authentication.getName();
            String receiver = null;

            if (conv.getParticipant1().equals(sender)) {
                receiver = conv.getParticipant2();
            } else if (conv.getParticipant2().equals(sender)) {
                receiver = conv.getParticipant1();
            } else {
                return ResponseEntity.status(403).body("Forbidden: You are not a registered participant in this specific conversation tunnel!");
            }

            Message m = new Message();
            m.setConversationId(conv.getId());
            m.setSenderId(sender);
            m.setReceiverId(receiver);
            m.setContent(dto.getContent());
            return ResponseEntity.ok(messageRepository.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/conversation/{id}")
    public ResponseEntity<?> getConversationHistory(@PathVariable Long id, Authentication authentication) {
        return conversationRepository.findById(id).map(conv -> {
            String currentUser = authentication.getName();
            if (!conv.getParticipant1().equals(currentUser) && !conv.getParticipant2().equals(currentUser)) {
                return ResponseEntity.status(403).body("Forbidden: You are not an active participant in this chat history!");
            }
            return ResponseEntity.ok(messageRepository.findByConversationIdOrderByCreatedAtAsc(id));
        }).orElse(ResponseEntity.notFound().build());
    }
}
