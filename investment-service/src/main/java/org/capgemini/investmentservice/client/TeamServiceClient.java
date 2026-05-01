package org.capgemini.investmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "TEAM-SERVICE")
public interface TeamServiceClient {

    @GetMapping("/teams/startup/{startupId}")
    List<Map<String, Object>> getTeamForStartup(@PathVariable("startupId") Long startupId);
}
