package org.capgemini.teamservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long startupId;

    @Column(nullable = false)
    private String invitedUserEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StartupRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamStatus status;

    private LocalDateTime joinedAt;
}
