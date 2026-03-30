package org.capgemini.investmentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class InvestmentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InvestmentServiceApplication.class, args);
        System.out.println("Investment Service started Successfully..");
    }
}
