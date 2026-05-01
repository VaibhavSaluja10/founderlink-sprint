package org.capgemini.teamservice.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.capgemini.teamservice.client.StartupServiceClient;
import org.capgemini.teamservice.config.RabbitConfig;
import org.capgemini.teamservice.dto.InviteDto;
import org.capgemini.teamservice.dto.JoinDto;
import org.capgemini.teamservice.entity.TeamMember;
import org.capgemini.teamservice.entity.TeamStatus;
import org.capgemini.teamservice.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    private TeamMemberRepository repository;

    @Autowired
    private StartupServiceClient startupServiceClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping("/invite")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('ADMIN')")
    public ResponseEntity<?> inviteUser(@RequestBody InviteDto inviteDto, Authentication authentication) {
        System.out.println("Calling /invite with User: " + authentication.getName() + " and Roles: " + authentication.getAuthorities());
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin) {
            try {
                Map<String, Object> startup = startupServiceClient.getStartupById(inviteDto.getStartupId());
                if (startup != null && !authentication.getName().equals(startup.get("founderEmail"))) {
                    return ResponseEntity.status(403).body("Error: Only the Lead Founder owner can invite to this team.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(403).body("Error: Startup ownership verification failed. Error: " + e.getMessage());
            }
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setStartupId(inviteDto.getStartupId());
        teamMember.setInvitedUserEmail(inviteDto.getInvitedUserId());
        teamMember.setRole(inviteDto.getRole());
        teamMember.setStatus(TeamStatus.INVITED);
        TeamMember saved = repository.save(teamMember);

        // Requirement: publishes event: TEAM_INVITE_SENT
        try {
            Map<String, Object> event = Map.of(
                "startupId", inviteDto.getStartupId(),
                "invitedUserId", inviteDto.getInvitedUserId(),
                "role", inviteDto.getRole().toString()
            );
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, event);
            System.out.println("Sent TEAM_INVITE_SENT event to RabbitMQ");
        } catch (Exception e) {
            System.err.println("Could not send notification to RabbitMQ: " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinTeam(@RequestBody JoinDto joinDto, Authentication authentication) {
        return repository.findByIdAndInvitedUserEmail(joinDto.getTeamId(), authentication.getName()).map(teamMember -> {
            if ("ACCEPT".equalsIgnoreCase(joinDto.getAction())) {
                teamMember.setStatus(TeamStatus.ACTIVE);
                teamMember.setJoinedAt(LocalDateTime.now());
            } else if ("REJECT".equalsIgnoreCase(joinDto.getAction())) {
                teamMember.setStatus(TeamStatus.REJECTED);
            } else {
                return ResponseEntity.badRequest().body("Invalid Action. Please use ACCEPT or REJECT.");
            }
            return ResponseEntity.ok(repository.save(teamMember));
        }).orElse(ResponseEntity.status(404).body("Error: Invitation not found or the email does not match your current token."));
    }

    @GetMapping("/my-invitations")
    @PreAuthorize("hasRole('COFOUNDER')")
    public ResponseEntity<?> getMyInvitations(Authentication authentication) {
        return ResponseEntity.ok(repository.findByInvitedUserEmail(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTeamMembers() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/startup/{startupId}")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('COFOUNDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getTeamForStartup(@PathVariable Long startupId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(repository.findByStartupId(startupId));
        }

        // Check if user is the Founder of this startup using Feign Client
        boolean isOwner = false;
        try {
            Map<String, Object> startup = startupServiceClient.getStartupById(startupId);
            if (startup != null && authentication.getName().equals(startup.get("founderEmail"))) {
                isOwner = true;
            }
        } catch (Exception e) {
            // Silently ignore - fallback to team membership check
        }

        if (isOwner) {
            return ResponseEntity.ok(repository.findByStartupId(startupId));
        }

        // Check if user is an ACTIVE member of the team
        List<TeamMember> members = repository.findByStartupId(startupId);
        boolean isMember = members.stream()
                .anyMatch(m -> m.getInvitedUserEmail().equalsIgnoreCase(authentication.getName()) && m.getStatus() == TeamStatus.ACTIVE);

        if (isMember) {
            return ResponseEntity.ok(members);
        }

        return ResponseEntity.status(403).body("Forbidden: You are not authorized to view the team for this startup.");
    }

    @PutMapping("/{memberId}/role")
    @PreAuthorize("hasRole('FOUNDER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long memberId, @RequestBody Map<String, String> body, Authentication authentication) {
        return repository.findById(memberId).map(member -> {
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                try {
                    Map<String, Object> startup = startupServiceClient.getStartupById(member.getStartupId());
                    if (startup == null || !authentication.getName().equals(startup.get("founderEmail"))) {
                        return ResponseEntity.status(403).body("Error: You are not authorized to manage roles for this team.");
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(403).body("Error: Failed to verify startup ownership.");
                }
            }

            // Update role
            try {
                String roleStr = body.get("role");
                if (roleStr == null) return ResponseEntity.badRequest().body("Error: Role field is missing.");
                org.capgemini.teamservice.entity.StartupRole newRole = org.capgemini.teamservice.entity.StartupRole.valueOf(roleStr.toUpperCase());
                member.setRole(newRole);
                return ResponseEntity.ok(repository.save(member));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error: Invalid role. Use: CTO, CPO, MARKETING_HEAD, or ENGINEERING_LEAD.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
