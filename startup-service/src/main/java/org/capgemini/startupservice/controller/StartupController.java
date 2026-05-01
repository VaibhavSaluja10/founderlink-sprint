package org.capgemini.startupservice.controller;

import org.capgemini.startupservice.dto.StartupAdminDto;
import org.capgemini.startupservice.dto.StartupPublicDto;
import org.capgemini.startupservice.entity.Startup;
import org.capgemini.startupservice.entity.StartupStatus;
import org.capgemini.startupservice.repository.StartupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.capgemini.startupservice.config.RabbitConfig;

import java.util.Map;

@RestController
@RequestMapping("/startups")
public class StartupController {

    @Autowired
    private StartupRepository repository;

    @Autowired
    private org.capgemini.startupservice.repository.FollowRepository followRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStartupStatus(@PathVariable Long id, @RequestParam StartupStatus status) {
        return repository.findById(id).map(startup -> {
            startup.setStatus(status);
            Startup saved = repository.save(startup);
            
            Map<String, Object> event = Map.of(
                "startupId", saved.getId(),
                "founderId", saved.getFounderEmail(),
                "status", status.toString(),
                "startupName", saved.getStartupName()
            );
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY_STATUS, event);
            
            // Return admin DTO (no members list for admin)
            return ResponseEntity.ok(new StartupAdminDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('FOUNDER')")
    public ResponseEntity<?> createStartup(@RequestBody Startup startup, Authentication authentication) {
        startup.setFounderEmail(authentication.getName());
        Startup saved = repository.save(startup);

        // Requirement: publishes event STARTUP_CREATED
        Map<String, Object> event = Map.of(
            "startupId", saved.getId(),
            "founderId", saved.getFounderEmail(),
            "industry", saved.getIndustry(),
            "fundingGoal", saved.getFundingGoal()
        );
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY_CREATED, event);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> getAllStartups(Authentication authentication) {
        // Admin: All startups with admin DTO (no members list shown)
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(repository.findAll().stream()
                    .map(StartupAdminDto::new)
                    .toList());
        }

        // Founder: Only own startups with full details
        boolean isFounder = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_FOUNDER"));
        if (isFounder) {
            return ResponseEntity.ok(repository.findByFounderEmail(authentication.getName()));
        }

        // CoFounder: Only own startups with full details
        boolean isCoFounder = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COFOUNDER"));
        if (isCoFounder) {
            return ResponseEntity.ok(repository.findByFounderEmail(authentication.getName()));
        }
        
        // Investor: Only APPROVED startups with limited public DTO
        return ResponseEntity.ok(repository.findAll().stream()
                .filter(s -> s.getStatus() == StartupStatus.APPROVED)
                .map(StartupPublicDto::new)
                .toList());
    }

    @PostMapping("/{id}/follow")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> followStartup(@PathVariable Long id, Authentication authentication) {
        return repository.findById(id).map(startup -> {
            // Investor can only follow APPROVED startups
            if (startup.getStatus() != StartupStatus.APPROVED) {
                return ResponseEntity.badRequest().body("Can only follow APPROVED startups.");
            }

            String email = authentication.getName();
            if (followRepository.existsByInvestorEmailAndStartupId(email, id)) {
                return ResponseEntity.badRequest().body("Already following this startup.");
            }

            org.capgemini.startupservice.entity.Follow follow = org.capgemini.startupservice.entity.Follow.builder()
                    .investorEmail(email)
                    .startupId(id)
                    .build();

            return ResponseEntity.ok(followRepository.save(follow));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/unfollow")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> unfollowStartup(@PathVariable Long id, Authentication authentication) {
        return followRepository.findByInvestorEmailAndStartupId(authentication.getName(), id).map(f -> {
            followRepository.delete(f);
            return ResponseEntity.ok("Unfollowed startup.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/followed")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> getFollowedStartups(Authentication authentication) {
        java.util.List<Long> followedIds = followRepository.findByInvestorEmail(authentication.getName()).stream()
                .map(org.capgemini.startupservice.entity.Follow::getStartupId)
                .toList();
        
        return ResponseEntity.ok(repository.findAllById(followedIds).stream()
                .map(StartupPublicDto::new)
                .toList());
    }

    @GetMapping("/opportunities")
    @PreAuthorize("hasRole('INVESTOR') or hasRole('COFOUNDER')")
    public ResponseEntity<?> getApprovedStartupOpportunities() {
        return ResponseEntity.ok(repository.findAll().stream()
                .filter(s -> s.getStatus() == StartupStatus.APPROVED)
                .map(StartupPublicDto::new)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStartupById(@PathVariable Long id, Authentication authentication) {
        return repository.findById(id).map(startup -> {
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isFounder = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_FOUNDER"));
            boolean isCoFounder = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COFOUNDER"));

            // Admin: admin DTO (no members list)
            if (isAdmin) {
                return ResponseEntity.ok(new StartupAdminDto(startup));
            }
            
            // Founder/CoFounder: full details of own startups
            if (isFounder || isCoFounder) {
                return ResponseEntity.ok(startup);
            }
            
            // Investor: public DTO only
            return ResponseEntity.ok(new StartupPublicDto(startup));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FOUNDER')")
    public ResponseEntity<?> updateStartup(@PathVariable Long id, @RequestBody Startup updatedStartup, Authentication authentication) {
        return repository.findById(id).map(startup -> {
            boolean isOwner = startup.getFounderEmail().equals(authentication.getName());
            if (!isOwner) {
                return ResponseEntity.status(403).body("Forbidden: You can only update your own startup.");
            }
            if (updatedStartup.getStartupName() != null) startup.setStartupName(updatedStartup.getStartupName());
            if (updatedStartup.getDescription() != null) startup.setDescription(updatedStartup.getDescription());
            if (updatedStartup.getIndustry() != null) startup.setIndustry(updatedStartup.getIndustry());
            if (updatedStartup.getProblemStatement() != null) startup.setProblemStatement(updatedStartup.getProblemStatement());
            if (updatedStartup.getSolution() != null) startup.setSolution(updatedStartup.getSolution());
            if (updatedStartup.getFundingGoal() != null) startup.setFundingGoal(updatedStartup.getFundingGoal());
            if (updatedStartup.getStage() != null) startup.setStage(updatedStartup.getStage());
            if (updatedStartup.getLocation() != null) startup.setLocation(updatedStartup.getLocation());
            
            return ResponseEntity.ok(repository.save(startup));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FOUNDER')")
    public ResponseEntity<?> deleteStartup(@PathVariable Long id, Authentication authentication) {
        return repository.findById(id).map(startup -> {
            boolean isOwner = startup.getFounderEmail().equals(authentication.getName());
            if (!isOwner) {
                return ResponseEntity.status(403).body("Forbidden: You can only delete your own startup.");
            }
            repository.delete(startup);
            return ResponseEntity.ok("Startup deleted successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }
}
