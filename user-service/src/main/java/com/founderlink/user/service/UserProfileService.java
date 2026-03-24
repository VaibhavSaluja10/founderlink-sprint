package com.founderlink.user.service;

import com.founderlink.user.entity.UserProfile;
import com.founderlink.user.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository repository;

    // ✅ CREATE PROFILE
    public UserProfile createProfile(UserProfile profile) {

        // Check if email already exists
        if (repository.existsByEmail(profile.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        return repository.save(profile);
    }

    // ✅ GET SINGLE PROFILE
    public UserProfile getProfile(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }

    // ✅ UPDATE PROFILE
    public UserProfile updateProfile(Long id, UserProfile updatedProfile) {

        UserProfile existingProfile = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        // 🔒 Check if email is being changed
        if (updatedProfile.getEmail() != null &&
                !updatedProfile.getEmail().equals(existingProfile.getEmail())) {

            if (repository.existsByEmail(updatedProfile.getEmail())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email already exists"
                );
            }

            existingProfile.setEmail(updatedProfile.getEmail());
        }

        // ✅ Update other fields
        if (updatedProfile.getName() != null) {
            existingProfile.setName(updatedProfile.getName());
        }

        if (updatedProfile.getSkills() != null) {
            existingProfile.setSkills(updatedProfile.getSkills());
        }

        if (updatedProfile.getExperience() != null) {
            existingProfile.setExperience(updatedProfile.getExperience());
        }

        if (updatedProfile.getBio() != null) {
            existingProfile.setBio(updatedProfile.getBio());
        }

        if (updatedProfile.getPortfolioLinks() != null) {
            existingProfile.setPortfolioLinks(updatedProfile.getPortfolioLinks());
        }

        return repository.save(existingProfile);
    }

    // ✅ GET ALL PROFILES
    public List<UserProfile> getAllProfiles() {
        return repository.findAll();
    }
}