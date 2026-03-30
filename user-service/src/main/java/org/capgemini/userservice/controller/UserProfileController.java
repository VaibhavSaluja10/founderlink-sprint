package org.capgemini.userservice.controller;

import org.capgemini.userservice.entity.UserProfile;
import org.capgemini.userservice.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    @Autowired
    private UserProfileRepository repository;

    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody UserProfile profile, Authentication authentication) {
        String requesterEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        // Use provided email for Admins, force requester email for others
        String targetEmail = (isAdmin && profile.getEmail() != null) ? profile.getEmail() : requesterEmail;

        if (repository.findByEmail(targetEmail).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Profile for " + targetEmail + " already exists!");
        }
        
        profile.setEmail(targetEmail);
        return ResponseEntity.ok(repository.save(profile));
    }

    @GetMapping
    public ResponseEntity<?> getAllProfiles(Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.ok(repository.findAll());
        }
        return repository.findByEmail(authentication.getName())
                .map(p -> ResponseEntity.ok(List.of(p)))
                .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).body("Forbidden: Only an admin can fetch specific user profiles by ID.");
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UserProfile updatedProfile, Authentication authentication) {
        return repository.findById(id).map(profile -> {
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && !profile.getEmail().equals(authentication.getName())) {
                return ResponseEntity.status(403).body("Forbidden: You can only update your own profile.");
            }
            if (updatedProfile.getName() != null) profile.setName(updatedProfile.getName());
            if (updatedProfile.getSkills() != null) profile.setSkills(updatedProfile.getSkills());
            if (updatedProfile.getExperience() != null) profile.setExperience(updatedProfile.getExperience());
            if (updatedProfile.getBio() != null) profile.setBio(updatedProfile.getBio());
            if (updatedProfile.getPortfolioLinks() != null) profile.setPortfolioLinks(updatedProfile.getPortfolioLinks());
            return ResponseEntity.ok(repository.save(profile));
        }).orElse(ResponseEntity.notFound().build());
    }
}
