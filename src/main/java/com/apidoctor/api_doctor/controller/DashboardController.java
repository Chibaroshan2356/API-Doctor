package com.apidoctor.api_doctor.controller;

import com.apidoctor.api_doctor.dto.DashboardDTO;
import com.apidoctor.api_doctor.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    public List<DashboardDTO> getDashboard() {
        return service.getDashboard();
    }
}