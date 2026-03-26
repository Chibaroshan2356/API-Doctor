package com.apidoctor.service;

import com.apidoctor.dto.ApiStatusDto;
import com.apidoctor.api_doctor.entity.ApiConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Transactional
public class HealthCheckService {
    
    @Autowired
    private ApiService apiService;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    /**
     * Check health of all APIs
     */
    public List<ApiStatusDto> checkAllApisHealth() {
        List<ApiConfig> apis = apiService.getActiveApis();
        List<ApiStatusDto> statuses = new ArrayList<>();
        
        List<CompletableFuture<ApiStatusDto>> futures = apis.stream()
            .map(api -> CompletableFuture.supplyAsync(() -> checkApiHealth(api), executorService))
            .toList();
        
        for (CompletableFuture<ApiStatusDto> future : futures) {
            try {
                statuses.add(future.get());
            } catch (Exception e) {
                // Handle exceptions
            }
        }
        
        return statuses;
    }
    
    /**
     * Check health of a single API
     */
    public ApiStatusDto checkApiHealth(ApiConfig api) {
        long startTime = System.currentTimeMillis();
        String status = "healthy";
        int responseTime = 0;
        
        try {
            URL url = new URL(api.getUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(api.getMethod() != null ? api.getMethod() : "GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            responseTime = (int) (System.currentTimeMillis() - startTime);
            
            // Check if response matches expected status
            if (api.getExpectedStatus() != null && responseCode != api.getExpectedStatus()) {
                status = "down";
            } else if (responseTime > 5000) {
                status = "slow";
            } else {
                status = "healthy";
            }
            
            connection.disconnect();
            
        } catch (IOException e) {
            status = "down";
            responseTime = (int) (System.currentTimeMillis() - startTime);
        }
        
        return new ApiStatusDto(
            api.getId(),
            api.getName(),
            api.getUrl(),
            status,
            responseTime
        );
    }
    
    /**
     * Check health of specific API by ID
     */
    public ApiStatusDto checkApiHealthById(Long apiId) {
        ApiConfig api = apiService.getApiById(apiId);
        if (api != null) {
            return checkApiHealth(api);
        }
        return null;
    }
}
