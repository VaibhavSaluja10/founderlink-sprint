package org.capgemini.investmentservice.controller;

import org.capgemini.investmentservice.entity.Investment;
import org.capgemini.investmentservice.entity.InvestmentStatus;
import org.capgemini.investmentservice.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.capgemini.investmentservice.config.RabbitConfig;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/investments")
public class InvestmentController {

    @Autowired
    private InvestmentRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> createInvestment(@RequestBody Investment investment, Authentication authentication,
            HttpServletRequest request) {
        investment.setInvestorEmail(authentication.getName());
        investment.setStatus(InvestmentStatus.PENDING);
        Investment saved = repository.save(investment);

        // Fetch founder email for notification
        String founderEmail = "admin@founderlink.com"; // Fallback
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", request.getHeader("Authorization"));
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    "http://STARTUP-SERVICE/startups/" + saved.getStartupId(),
                    HttpMethod.GET,
                    entity,
                    Map.class);
            Map<String, Object> startup = response.getBody();
            if (startup != null) {
                founderEmail = (String) startup.get("founderEmail");
            }
        } catch (Exception e) {
            // Log and use fallback
        }

        // Requirement: publishes event INVESTMENT_CREATED
        Map<String, Object> event = Map.of(
                "startupId", saved.getStartupId(),
                "amount", saved.getAmount(),
                "founderEmail", founderEmail);
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, event);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/startup/{startupId}")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('COFOUNDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInvestmentsForStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(repository.findByStartupId(startupId));
    }

    @GetMapping("/investor/{investorEmail}")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<?> getInvestmentsForInvestor(@PathVariable String investorEmail,
            Authentication authentication) {
        if (!authentication.getName().equals(investorEmail)) {
            return ResponseEntity.status(403).body("Forbidden: You can only view your own investments.");
        }
        return ResponseEntity.ok(repository.findByInvestorEmail(investorEmail));
    }

    @PutMapping("/{investmentId}/status")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('COFOUNDER')")
    public ResponseEntity<?> updateInvestmentStatus(@PathVariable Long investmentId,
            @RequestBody Map<String, String> body, Authentication authentication, HttpServletRequest request) {
        return repository.findById(investmentId).map(investment -> {
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("Authorization", request.getHeader("Authorization"));
                    HttpEntity<String> entity = new HttpEntity<>(headers);

                    ResponseEntity<Map> response = restTemplate.exchange(
                            "http://STARTUP-SERVICE/startups/" + investment.getStartupId(),
                            HttpMethod.GET,
                            entity,
                            Map.class);

                    Map<String, Object> startup = response.getBody();
                    if (startup != null && !authentication.getName().equals(startup.get("founderEmail"))) {
                        return ResponseEntity.status(403).body("Error: You are not the Founder owner of this startup!");
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(403).body("Error: Failed to verify cross-service startup ownership.");
                }
            }

            InvestmentStatus newStatus;
            try {
                String statusStr = body.get("status");
                if (statusStr == null) return ResponseEntity.badRequest().body("Error: Status field is required in JSON.");
                newStatus = InvestmentStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Error: Invalid status value provided. Must be PENDING, APPROVED, REJECTED, or COMPLETED.");
            }

            investment.setStatus(newStatus);
            Investment updated = repository.save(investment);

            // Attempt Notification - but don't crash if it fails
            try {
                java.util.Map<String, Object> statusEvent = new java.util.HashMap<>();
                statusEvent.put("investmentId", updated.getId());
                statusEvent.put("investorEmail", updated.getInvestorEmail());
                statusEvent.put("status", updated.getStatus().toString());
                statusEvent.put("amount", updated.getAmount() != null ? updated.getAmount().toString() : "0.0");
                
                rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, statusEvent);
            } catch (Exception e) {
                System.err.println("⚠️ Warning: Database updated, but RabbitMQ notification failed: " + e.getMessage());
                return ResponseEntity.ok().body(Map.of(
                    "message", "Investment status updated successfully, but notification could not be sent.",
                    "data", updated
                ));
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
