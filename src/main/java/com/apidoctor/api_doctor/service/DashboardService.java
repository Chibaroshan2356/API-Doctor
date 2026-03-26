package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.dto.DashboardDTO;
import com.apidoctor.api_doctor.dto.ApiUptimeDTO;
import com.apidoctor.api_doctor.repository.ApiMetricRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private final ApiMetricRepository repository;
    private final HealthService healthService;

    public DashboardService(ApiMetricRepository repository, HealthService healthService) {
        this.repository = repository;
        this.healthService = healthService;
    }

    public List<DashboardDTO> getDashboard() {

        Map<String, String> health = healthService.getApiHealth();
        List<ApiUptimeDTO> uptimeList = repository.getApiUptime();
        List<Object[]> avgTimes = repository.getAverageResponseTimes();

        Map<String, Double> uptimeMap = new HashMap<>();
        for (ApiUptimeDTO u : uptimeList) {
            uptimeMap.put(u.getApiName(), u.getUptime());
        }

        List<DashboardDTO> dashboard = new ArrayList<>();

        for (Object[] obj : avgTimes) {

            String apiName = (String) obj[0];
            double avgTime = (Double) obj[1];

            dashboard.add(
                    new DashboardDTO(
                            apiName,
                            health.getOrDefault(apiName, "UNKNOWN"),
                            avgTime,
                            uptimeMap.getOrDefault(apiName, 0.0)));
        }

        return dashboard;
    }
}