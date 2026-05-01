package org.capgemini.startupservice.dto;

import lombok.Getter;
import lombok.Setter;
import org.capgemini.startupservice.entity.Startup;
import org.capgemini.startupservice.entity.StartupStage;
import java.math.BigDecimal;

@Getter
@Setter
public class StartupPublicDto {
    private Long id;
    private String founderEmail;
    private String startupName;
    private String industry;
    private StartupStage stage;
    private BigDecimal fundingGoal;
    private String location;

    public StartupPublicDto(Startup startup) {
        this.id = startup.getId();
        this.founderEmail = startup.getFounderEmail();
        this.startupName = startup.getStartupName();
        this.industry = startup.getIndustry();
        this.stage = startup.getStage();
        this.fundingGoal = startup.getFundingGoal();
        this.location = startup.getLocation();
    }
}
