package com.apidoctor.api_doctor.controller;

import com.apidoctor.api_doctor.dto.ApiChartDTO;
import com.apidoctor.api_doctor.dto.ApiHistoryDTO;
import com.apidoctor.api_doctor.dto.ApiMetricSummary;
import com.apidoctor.api_doctor.dto.ApiUptimeDTO;
import com.apidoctor.api_doctor.repository.ApiMetricRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class ApiMetricsController {

    private final ApiMetricRepository repository;

    public ApiMetricsController(ApiMetricRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ApiMetricSummary> getMetrics() {
        return repository.getApiSummary();
    }

    @GetMapping("/uptime")
    public List<ApiUptimeDTO> getUptime() {
        return repository.getApiUptime();
    }

    @GetMapping("/history")
    public List<ApiHistoryDTO> getHistory(@RequestParam String api) {
        return repository.getApiHistory(api);
    }

    @GetMapping("/chart")
    public List<ApiChartDTO> getChart(@RequestParam String api) {
        return repository.getChartData(api);
    }
}