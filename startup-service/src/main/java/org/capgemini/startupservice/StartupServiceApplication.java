package org.capgemini.startupservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StartupServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StartupServiceApplication.class, args);
        System.out.println("Startup Service started Successfully..");
    }
}
