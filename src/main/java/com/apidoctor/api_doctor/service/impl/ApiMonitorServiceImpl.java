package com.apidoctor.api_doctor.service.impl;

import com.apidoctor.api_doctor.entity.ApiConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiMonitorServiceImpl {

    private final WebClient webClient = WebClient.create();

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

                }, error -> {

                    System.out.println(api.getName() + " FAILED");

                });

    }
}