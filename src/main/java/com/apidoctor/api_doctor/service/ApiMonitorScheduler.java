package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.api_doctor.repository.ApiConfigRepository;
import com.apidoctor.api_doctor.service.impl.ApiMonitorServiceImpl;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApiMonitorScheduler {

    private final ApiConfigRepository repository;
    private final ApiMonitorServiceImpl monitorService;

    public ApiMonitorScheduler(ApiConfigRepository repository,
            ApiMonitorServiceImpl monitorService) {
        this.repository = repository;
        this.monitorService = monitorService;
    }

    @Scheduled(fixedRate = 60000)
    public void monitorApis() {

        List<ApiConfig> apis = repository.findByActiveTrue();

        for (ApiConfig api : apis) {
            monitorService.checkApi(api);
        }

    }
}