package com.apidoctor.repository;

import com.apidoctor.api_doctor.entity.ApiConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiConfigRepository extends JpaRepository<ApiConfig, Long> {
    
    // Find all active APIs
    List<ApiConfig> findByActiveTrue();
    
    // Find API by name
    List<ApiConfig> findByNameContainingIgnoreCase(String name);
    
    // Find API by URL
    List<ApiConfig> findByUrlContainingIgnoreCase(String url);
    
    // Count active APIs
    long countByActiveTrue();
    
    // Find APIs by method
    List<ApiConfig> findByMethod(String method);
}
