package com.apidoctor.service;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.repository.ApiConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ApiService {
    
    @Autowired
    private ApiConfigRepository apiRepository;
    
    public List<ApiConfig> getAllApis() {
        return apiRepository.findAll();
    }
    
    public List<ApiConfig> getActiveApis() {
        return apiRepository.findByActiveTrue();
    }
    
    public ApiConfig getApiById(Long id) {
        return apiRepository.findById(id).orElse(null);
    }
    
    public ApiConfig getApiByName(String name) {
        return apiRepository.findByNameContainingIgnoreCase(name).stream().findFirst().orElse(null);
    }
    
    public ApiConfig createApi(ApiConfig api) {
        api.setCreatedAt(LocalDateTime.now());
        return apiRepository.save(api);
    }
    
    public ApiConfig updateApi(Long id, ApiConfig apiDetails) {
        ApiConfig existingApi = apiRepository.findById(id).orElse(null);
        if (existingApi != null) {
            existingApi.setName(apiDetails.getName());
            existingApi.setUrl(apiDetails.getUrl());
            existingApi.setMethod(apiDetails.getMethod());
            existingApi.setExpectedStatus(apiDetails.getExpectedStatus());
            existingApi.setActive(apiDetails.getActive());
            return apiRepository.save(existingApi);
        }
        return null;
    }
    
    public void deleteApi(Long id) {
        apiRepository.deleteById(id);
    }
    
    public List<ApiConfig> getApisByMethod(String method) {
        return apiRepository.findByMethod(method);
    }
    
    public Long getActiveApisCount() {
        return apiRepository.countByActiveTrue();
    }
}
