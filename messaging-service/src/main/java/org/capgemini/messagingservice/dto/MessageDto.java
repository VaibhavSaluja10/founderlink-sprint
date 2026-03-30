package org.capgemini.messagingservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageDto {
    private Long conversationId;
    private String content;
}
