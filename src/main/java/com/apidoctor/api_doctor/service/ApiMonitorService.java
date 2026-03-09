package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.entity.ApiMetric;
import com.apidoctor.api_doctor.repository.ApiMetricRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class ApiMonitorService {

    private final WebClient webClient;
    private final ApiMetricRepository apiMetricRepository;

    public ApiMonitorService(WebClient webClient, ApiMetricRepository apiMetricRepository) {
        this.webClient = webClient;
        this.apiMetricRepository = apiMetricRepository;
    }

    @Scheduled(fixedRate = 60000)
    public void checkApi() {

        String apiName = "JSONPlaceholder";
        String apiUrl = "https://jsonplaceholder.typicode.com/posts/1";

        long start = System.currentTimeMillis();

        webClient.get()
                .uri(apiUrl)
                .retrieve()
                .toEntity(String.class)
                .flatMap(response -> {

                    long end = System.currentTimeMillis();
                    long responseTime = end - start;

                    int statusCode = response.getStatusCode().value();

                    ApiMetric metric = new ApiMetric();
                    metric.setApiName(apiName);
                    metric.setApiUrl(apiUrl);
                    metric.setCheckedAt(LocalDateTime.now());
                    metric.setResponseTimeMs(responseTime);
                    metric.setStatusCode(statusCode);
                    metric.setSuccess(true);

                    apiMetricRepository.save(metric);

                    System.out.println("API Checked: " + apiName +
                            " | Status: " + statusCode +
                            " | Time: " + responseTime + "ms");

                    return Mono.empty();
                })
                .onErrorResume(error -> {

                    long end = System.currentTimeMillis();
                    long responseTime = end - start;

                    ApiMetric metric = new ApiMetric();
                    metric.setApiName(apiName);
                    metric.setApiUrl(apiUrl);
                    metric.setCheckedAt(LocalDateTime.now());
                    metric.setResponseTimeMs(responseTime);
                    metric.setStatusCode(0);
                    metric.setSuccess(false);

                    apiMetricRepository.save(metric);

                    System.out.println("API FAILED: " + apiName);

                    return Mono.empty();
                })
                .subscribe();
    }
}