package com.apidoctor.api_doctor.service.impl;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.api_doctor.service.AlertService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiMonitorServiceImpl {

    private final WebClient webClient = WebClient.create();
    private final AlertService alertService;

    public ApiMonitorServiceImpl(AlertService alertService) {
        this.alertService = alertService;
    }

    public void checkApi(ApiConfig api) {

        long start = System.currentTimeMillis();

        webClient.get()
                .uri(api.getUrl())
                .retrieve()
                .toBodilessEntity()
                .subscribe(response -> {

                    long responseTime = System.currentTimeMillis() - start;

                    System.out.println(
                            api.getName() +
                                    " Status: " + response.getStatusCode() +
                                    " Time: " + responseTime + "ms");

                    // ⚠ Detect slow API
                    if (responseTime > 2000) {
                        alertService.sendSlowAlert(api.getName(), responseTime);
                    }

                }, error -> {

                    System.out.println(api.getName() + " FAILED");

                    // Trigger DOWN alert
                    alertService.sendAlert(api.getName());

                });
    }
}