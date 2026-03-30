package org.capgemini.startupservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "startups")
@Getter
@Setter
@NoArgsConstructor
public class Startup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String founderEmail;

    @Column(nullable = false)
    private String startupName;

    private String description;
    private String industry;
    private String problemStatement;
    private String solution;
    private BigDecimal fundingGoal;
    private String location;

    @Enumerated(EnumType.STRING)
    private StartupStage stage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StartupStatus status = StartupStatus.PENDING;
}
