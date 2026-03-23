package com.founderlink.user.controller;

import com.founderlink.user.entity.UserProfile;
import com.founderlink.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "User Profile Management", description = "Endpoints for creating, updating, and retrieving user profiles")
public class UserProfileController {

    @Autowired
    private UserProfileService service;

    @PostMapping
    @Operation(summary = "Create a User Profile", description = "Creates a new user profile with details like bio and skills")
    public UserProfile createProfile(@RequestBody UserProfile profile) {
        return service.createProfile(profile);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User Profile", description = "Retrieves the profile of a user using their ID")
    public UserProfile getProfile(@PathVariable("id") Long id) {
        return service.getProfile(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update User Profile", description = "Updates an existing user profile's information")
    public UserProfile updateProfile(@PathVariable("id") Long id, @RequestBody UserProfile profile) {
        return service.updateProfile(id, profile);
    }

    @GetMapping
    public List<UserProfile> getAllProfiles() {
        return service.getAllProfiles();
    }
}