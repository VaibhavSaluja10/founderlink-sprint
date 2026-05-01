package org.capgemini.teamservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "STARTUP-SERVICE")
public interface StartupServiceClient {

    @GetMapping("/startups/{id}")
    Map<String, Object> getStartupById(@PathVariable("id") Long id);
}
