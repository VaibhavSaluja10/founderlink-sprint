package org.capgemini.teamservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TeamServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TeamServiceApplication.class, args);
        System.out.println("Team Service started Successfully..");
    }
}
