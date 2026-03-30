package org.capgemini.messagingservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConversationDto {
    private String targetEmail;
    private String targetRole; 
}
