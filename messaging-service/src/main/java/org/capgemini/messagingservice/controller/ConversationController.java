package org.capgemini.messagingservice.controller;

import org.capgemini.messagingservice.dto.ConversationDto;
import org.capgemini.messagingservice.entity.Conversation;
import org.capgemini.messagingservice.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    @Autowired
    private ConversationRepository repository;

    @PostMapping
    public ResponseEntity<?> createConversation(@RequestBody ConversationDto dto, Authentication authentication) {
        String myRole = authentication.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse(null);
        String targetRole = dto.getTargetRole();

        if (myRole == null || targetRole == null) {
            return ResponseEntity.badRequest().body("Both roles must be explicitly declared to validate the structural combination.");
        }

        boolean meFounder = myRole.equals("ROLE_FOUNDER");
        boolean meInvestor = myRole.equals("ROLE_INVESTOR");
        boolean meCoFounder = myRole.equals("ROLE_COFOUNDER");

        boolean targetFounder = targetRole.equals("ROLE_FOUNDER");
        boolean targetInvestor = targetRole.equals("ROLE_INVESTOR");
        boolean targetCoFounder = targetRole.equals("ROLE_COFOUNDER");

        boolean valid = false;
        if ((meFounder && targetInvestor) || (meInvestor && targetFounder)) {
            valid = true;
        } else if ((meFounder && targetCoFounder) || (meCoFounder && targetFounder)) {
            valid = true;
        }

        if (!valid) {
            return ResponseEntity.status(403).body("Forbidden: Invalid networking combination! Investors cannot message Investors, and Co-founders cannot message Co-founders.");
        }

        String p1 = authentication.getName();
        String p2 = dto.getTargetEmail();

        var existing1 = repository.findByParticipant1AndParticipant2(p1, p2);
        if (existing1.isPresent()) return ResponseEntity.ok(existing1.get());
        
        var existing2 = repository.findByParticipant1AndParticipant2(p2, p1);
        if (existing2.isPresent()) return ResponseEntity.ok(existing2.get());

        Conversation c = new Conversation();
        c.setParticipant1(p1);
        c.setParticipant2(p2);
        return ResponseEntity.ok(repository.save(c));
    }
}
