package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.entity.ApiMetric;
import com.apidoctor.api_doctor.repository.ApiMetricRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HealthService {

    private final ApiMetricRepository repository;

    public HealthService(ApiMetricRepository repository) {
        this.repository = repository;
    }

    public Map<String, String> getApiHealth() {

        List<ApiMetric> latestMetrics = repository.findLatestMetrics();

        Map<String, String> health = new HashMap<>();

        for (ApiMetric metric : latestMetrics) {

            List<ApiMetric> lastMetrics = repository.findLastMetricsByApi(metric.getApiName());

            int failureCount = 0;

            for (int i = 0; i < Math.min(3, lastMetrics.size()); i++) {

                if (!lastMetrics.get(i).getSuccess()) {
                    failureCount++;
                }

            }

            if (failureCount >= 3) {
                health.put(metric.getApiName(), "DOWN");
            } else {
                health.put(metric.getApiName(), "UP");
            }
        }

        return health;
    }
}