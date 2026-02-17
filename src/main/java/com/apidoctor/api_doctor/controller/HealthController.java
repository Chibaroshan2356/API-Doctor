package com.apidoctor.api_doctor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "API Doctor is running!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }
}
