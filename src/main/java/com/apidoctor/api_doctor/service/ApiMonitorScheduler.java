package com.apidoctor.api_doctor.service;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.repository.ApiConfigRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApiMonitorScheduler {

    private final ApiConfigRepository repository;
    private final ApiMonitorService monitorService;

    public ApiMonitorScheduler(ApiConfigRepository repository,
            ApiMonitorService monitorService) {
        this.repository = repository;
        this.monitorService = monitorService;
    }

    @Scheduled(fixedRate = 60000)
    public void monitorApis() {

        List<ApiConfig> apis = repository.findByActiveTrue();

        apis.parallelStream().forEach(api -> {
            monitorService.checkApi(api);
        });
    }
}