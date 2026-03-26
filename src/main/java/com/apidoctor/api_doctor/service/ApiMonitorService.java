package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.api_doctor.entity.ApiMetric;
import com.apidoctor.api_doctor.repository.ApiMetricRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class ApiMonitorService {

    private final WebClient webClient;
    private final ApiMetricRepository apiMetricRepository;

    public ApiMonitorService(WebClient webClient,
            ApiMetricRepository apiMetricRepository) {
        this.webClient = webClient;
        this.apiMetricRepository = apiMetricRepository;
    }

    public void checkApi(ApiConfig api) {

        long start = System.currentTimeMillis();

        webClient.get()
                .uri(api.getUrl())
                .retrieve()
                .toEntity(String.class)
                .flatMap(response -> {

                    long responseTime = System.currentTimeMillis() - start;

                    int statusCode = response.getStatusCode().value();

                    ApiMetric metric = new ApiMetric();
                    metric.setApiName(api.getName());
                    metric.setApiUrl(api.getUrl());
                    metric.setCheckedAt(LocalDateTime.now());
                    metric.setResponseTimeMs(responseTime);
                    metric.setStatusCode(statusCode);
                    metric.setSuccess(statusCode == api.getExpectedStatus());

                    apiMetricRepository.save(metric);

                    System.out.println("API Checked: " + api.getName() +
                            " | Status: " + statusCode +
                            " | Time: " + responseTime + "ms");

                    return Mono.empty();
                })
                .onErrorResume(error -> {

                    long responseTime = System.currentTimeMillis() - start;

                    ApiMetric metric = new ApiMetric();
                    metric.setApiName(api.getName());
                    metric.setApiUrl(api.getUrl());
                    metric.setCheckedAt(LocalDateTime.now());
                    metric.setResponseTimeMs(responseTime);
                    metric.setStatusCode(0);
                    metric.setSuccess(false);

                    apiMetricRepository.save(metric);

                    System.out.println("API FAILED: " + api.getName());

                    return Mono.empty();
                })
                .subscribe();
    }
}