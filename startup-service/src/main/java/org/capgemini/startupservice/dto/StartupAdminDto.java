package org.capgemini.startupservice.dto;

import lombok.Getter;
import lombok.Setter;
import org.capgemini.startupservice.entity.Startup;
import org.capgemini.startupservice.entity.StartupStage;
import org.capgemini.startupservice.entity.StartupStatus;
import java.math.BigDecimal;

@Getter
@Setter
public class StartupAdminDto {
    private Long id;
    private String founderEmail;
    private String startupName;
    private String description;
    private String industry;
    private String problemStatement;
    private String solution;
    private BigDecimal fundingGoal;
    private String location;
    private StartupStage stage;
    private StartupStatus status;

    public StartupAdminDto(Startup startup) {
        this.id = startup.getId();
        this.founderEmail = startup.getFounderEmail();
        this.startupName = startup.getStartupName();
        this.description = startup.getDescription();
        this.industry = startup.getIndustry();
        this.problemStatement = startup.getProblemStatement();
        this.solution = startup.getSolution();
        this.fundingGoal = startup.getFundingGoal();
        this.location = startup.getLocation();
        this.stage = startup.getStage();
        this.status = startup.getStatus();
    }
}
