package org.capgemini.notificationservice.service;

import org.capgemini.notificationservice.config.RabbitConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Map;

@Service
public class NotificationConsumer {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Value("${founderlink.notifications.investor-alert-emails:}")
    private String investorAlertEmails;

    @RabbitListener(queues = RabbitConfig.STARTUP_QUEUE)
    public void consumeStartupEvent(Map<String, Object> event) {
        if (event.containsKey("status")) {
            // It's a STATUS UPDATE (Approved/Rejected)
            String founderEmail = (String) event.get("founderId");
            String status = (String) event.get("status");
            String startupName = (String) event.get("startupName");
            String message = "Your startup '" + startupName + "' has been " + status + "!";
            
            notificationService.createNotification(founderEmail, message, "STARTUP_STATUS_UPDATED");
            emailService.sendEmail(founderEmail, "FounderLink startup status update", message);
        } else {
            // It's a NEW STARTUP CREATED
            String industry = (String) event.get("industry");
            Object fundingGoal = event.get("fundingGoal");
            String message = "New startup created in " + industry + " industry. Check it out!";
            String founderEmail = (String) event.get("founderId"); 
            
            // Notify an admin
            String adminEmail = "admin@founderlink.com";
            notificationService.createNotification(adminEmail, message, "STARTUP_CREATED");
            
            // Notify Founder too (User satisfaction)
            notificationService.createNotification(founderEmail, "Your startup has been created successfully and is pending approval!", "STARTUP_CREATED");
            
            emailService.sendEmail(adminEmail, "FounderLink new startup created", message);
            emailService.sendEmail(founderEmail, "FounderLink startup submitted", "Your startup has been created successfully and is pending approval!");

            Arrays.stream(investorAlertEmails.split(","))
                    .map(String::trim)
                    .filter(email -> !email.isBlank())
                    .forEach(email -> {
                        String investorMessage = "New startup opportunity in " + industry + " with funding goal " + fundingGoal + ". Login to FounderLink to review it.";
                        notificationService.createNotification(email, investorMessage, "STARTUP_CREATED");
                        emailService.sendEmail(email, "FounderLink new startup opportunity", investorMessage);
                    });
        }
    }

    @RabbitListener(queues = RabbitConfig.INVESTMENT_QUEUE)
    public void consumeInvestmentEvent(Map<String, Object> event) {
        if (event.containsKey("status")) {
            // It's a status update (Approved/Rejected) - Notify Investor
            String investorEmail = (String) event.get("investorEmail");
            String status = (String) event.get("status");
            Object amount = event.get("amount");
            String message = "Your investment of Rs " + amount + " has been " + status + "!";
            notificationService.createNotification(investorEmail, message, "INVESTMENT_STATUS_UPDATED");
            emailService.sendEmail(investorEmail, "FounderLink investment status update", message);
        } else {
            // It's a new investment - Notify Founder
            String founderEmail = (String) event.get("founderEmail");
            Object amount = event.get("amount");
            String message = "Congratulations! You received a new investment of Rs " + amount + "!";
            notificationService.createNotification(founderEmail, message, "INVESTMENT_CREATED");
            emailService.sendEmail(founderEmail, "FounderLink new investment request", message);
        }
    }

    @RabbitListener(queues = RabbitConfig.TEAM_QUEUE)
    public void consumeTeamEvent(Map<String, Object> event) {
        String invitedEmail = (String) event.get("invitedUserId");
        String role = (String) event.get("role");
        String message = "You have been invited to join a startup team as " + role + ". Please Accept/Reject.";
        
        notificationService.createNotification(invitedEmail, message, "TEAM_INVITE_SENT");
        emailService.sendEmail(invitedEmail, "FounderLink team invitation", message);
    }
}
