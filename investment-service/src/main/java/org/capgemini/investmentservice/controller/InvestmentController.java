package org.capgemini.investmentservice.controller;

import org.capgemini.investmentservice.client.StartupServiceClient;
import org.capgemini.investmentservice.client.TeamServiceClient;
import org.capgemini.investmentservice.entity.Investment;
import org.capgemini.investmentservice.entity.InvestmentStatus;
import org.capgemini.investmentservice.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.capgemini.investmentservice.config.RabbitConfig;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/investments")
public class InvestmentController {

    @Autowired
    private InvestmentRepository repository;

    @Autowired
    private StartupServiceClient startupServiceClient;

    @Autowired
    private TeamServiceClient teamServiceClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // ─── Investor: Create an investment request ───
    @PostMapping
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> createInvestment(@RequestBody Investment investment, Authentication authentication) {
        investment.setInvestorEmail(authentication.getName());
        investment.setStatus(InvestmentStatus.PENDING);
        Investment saved = repository.save(investment);

        // Attempt notification via RabbitMQ (non-blocking)
        try {
            String founderEmail = "admin@founderlink.com"; // Fallback
            try {
                Map<String, Object> startup = startupServiceClient.getStartupById(saved.getStartupId());
                if (startup != null) {
                    founderEmail = (String) startup.get("founderEmail");
                }
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch startup info via Feign: " + e.getMessage());
            }

            Map<String, Object> event = Map.of(
                    "startupId", saved.getStartupId(),
                    "amount", saved.getAmount(),
                    "founderEmail", founderEmail);
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, event);
        } catch (Exception e) {
            System.err.println("Warning: Investment saved, but RabbitMQ notification failed: " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    // ─── Investor: Get own investments ───
    @GetMapping("/my")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> getMyInvestments(Authentication authentication) {
        return ResponseEntity.ok(repository.findByInvestorEmail(authentication.getName()));
    }

    // ─── Admin: Get ALL investments ───
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllInvestments() {
        return ResponseEntity.ok(repository.findAll());
    }

    // ─── Founder/CoFounder/Admin/Investor: Get investments for a specific startup ───
    @GetMapping("/startup/{startupId}")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('COFOUNDER') or hasRole('ADMIN') or hasRole('INVESTOR')")
    public ResponseEntity<?> getInvestmentsForStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(repository.findByStartupId(startupId));
    }

    // ─── Investor: Get own investments by email (backward compat) ───
    @GetMapping("/investor/{investorEmail}")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> getInvestmentsForInvestor(@PathVariable String investorEmail,
            Authentication authentication) {
        if (!authentication.getName().equals(investorEmail)) {
            return ResponseEntity.status(403).body("Forbidden: You can only view your own investments.");
        }
        return ResponseEntity.ok(repository.findByInvestorEmail(investorEmail));
    }

    // ─── Founder/CoFounder: Update investment status (APPROVED / DISAPPROVED) ───
    @PutMapping("/{investmentId}/status")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('COFOUNDER')")
    public ResponseEntity<?> updateInvestmentStatus(@PathVariable Long investmentId,
            @RequestBody Map<String, String> body, Authentication authentication) {
        return repository.findById(investmentId).map(investment -> {
            boolean authorized = false;

            try {
                Map<String, Object> startup = startupServiceClient.getStartupById(investment.getStartupId());
                if (startup != null && authentication.getName().equals(startup.get("founderEmail"))) {
                    authorized = true;
                }
            } catch (Exception e) {
                return ResponseEntity.status(403).body("Error: Failed to verify startup ownership.");
            }

            if (!authorized) {
                try {
                    List<Map<String, Object>> teamMembers = teamServiceClient.getTeamForStartup(investment.getStartupId());
                    authorized = teamMembers.stream().anyMatch(member ->
                            authentication.getName().equalsIgnoreCase(String.valueOf(member.get("invitedUserEmail")))
                                    && "ACTIVE".equalsIgnoreCase(String.valueOf(member.get("status"))));
                } catch (Exception e) {
                    return ResponseEntity.status(403).body("Error: Failed to verify startup team membership.");
                }
            }

            if (!authorized) {
                return ResponseEntity.status(403).body("Error: You are not authorized to update this startup investment.");
            }

            InvestmentStatus newStatus;
            try {
                String statusStr = body.get("status");
                if (statusStr == null) return ResponseEntity.badRequest().body("Error: Status field is required in JSON.");
                newStatus = InvestmentStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Error: Invalid status. Must be PENDING, APPROVED, or DISAPPROVED.");
            }

            investment.setStatus(newStatus);
            Investment updated = repository.save(investment);

            // Attempt Notification - non-blocking
            try {
                java.util.Map<String, Object> statusEvent = new java.util.HashMap<>();
                statusEvent.put("investmentId", updated.getId());
                statusEvent.put("investorEmail", updated.getInvestorEmail());
                statusEvent.put("status", updated.getStatus().toString());
                statusEvent.put("amount", updated.getAmount() != null ? updated.getAmount().toString() : "0.0");

                rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, statusEvent);
            } catch (Exception e) {
                System.err.println("Warning: Database updated, but RabbitMQ notification failed: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
