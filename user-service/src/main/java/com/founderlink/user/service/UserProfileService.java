package com.founderlink.user.service;

import com.founderlink.user.entity.UserProfile;
import com.founderlink.user.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository repository;

    public UserProfile createProfile(UserProfile profile) {
        return repository.save(profile);
    }

    public UserProfile getProfile(Long id) {
        return repository.findById(id).orElse(null);
    }

    public UserProfile updateProfile(Long id, UserProfile updatedProfile) {
        UserProfile existingProfile = repository.findById(id).orElse(null);
        if (existingProfile != null) {
            existingProfile.setName(updatedProfile.getName());
            existingProfile.setSkills(updatedProfile.getSkills());
            existingProfile.setExperience(updatedProfile.getExperience());
            existingProfile.setBio(updatedProfile.getBio());
            existingProfile.setPortfolioLinks(updatedProfile.getPortfolioLinks());
            return repository.save(existingProfile);
        }
        return null;
    }

    public List<UserProfile> getAllProfiles() {
        return repository.findAll();
    }
}
