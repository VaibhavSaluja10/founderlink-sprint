package org.capgemini.teamservice.dto;
import org.capgemini.teamservice.entity.StartupRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteDto {
    private Long startupId;
    private String invitedUserId;
    private StartupRole role;
}
