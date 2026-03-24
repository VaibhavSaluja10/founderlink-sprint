package com.founderlink.user.controller;

import com.founderlink.user.entity.UserProfile;
import com.founderlink.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<UserProfile> createProfile(@RequestBody UserProfile profile) {
        UserProfile created = service.createProfile(profile);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User Profile", description = "Retrieves the profile of a user using their ID")
    public ResponseEntity<UserProfile> getProfile(@PathVariable("id") Long id) {
        return new ResponseEntity<>(service.getProfile(id), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update User Profile", description = "Updates an existing user profile's information")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable("id") Long id, @RequestBody UserProfile profile) {
        return new ResponseEntity<>(service.updateProfile(id, profile), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<UserProfile>> getAllProfiles() {
        return new ResponseEntity<>(service.getAllProfiles(), HttpStatus.OK);
    }
}