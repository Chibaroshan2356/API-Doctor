package com.apidoctor.controller;

import com.apidoctor.api_doctor.entity.ApiConfig;
import com.apidoctor.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apis")
@CrossOrigin(origins = "http://localhost:5173") // IMPORTANT - Match your frontend port
public class ApiController {
    
    @Autowired
    private ApiService apiService;
    
    /**
     * Test endpoint - no database dependency
     */
    @GetMapping("/test")
    public ResponseEntity<List<String>> test() {
        return ResponseEntity.ok(List.of("API1", "API2", "Test Working"));
    }
    
    /**
     * Get all APIs
     */
    @GetMapping
    public ResponseEntity<List<ApiConfig>> getAllApis() {
        List<ApiConfig> apis = apiService.getAllApis();
        return ResponseEntity.ok(apis);
    }
    
    /**
     * Get all active APIs
     */
    @GetMapping("/active")
    public ResponseEntity<List<ApiConfig>> getActiveApis() {
        List<ApiConfig> apis = apiService.getActiveApis();
        return ResponseEntity.ok(apis);
    }
    
    /**
     * Get API by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiConfig> getApiById(@PathVariable Long id) {
        ApiConfig api = apiService.getApiById(id);
        if (api != null) {
            return ResponseEntity.ok(api);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Create new API
     */
    @PostMapping
    public ResponseEntity<ApiConfig> createApi(@RequestBody ApiConfig api) {
        ApiConfig createdApi = apiService.createApi(api);
        return ResponseEntity.ok(createdApi);
    }
    
    /**
     * Update API
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiConfig> updateApi(@PathVariable Long id, @RequestBody ApiConfig api) {
        ApiConfig updatedApi = apiService.updateApi(id, api);
        if (updatedApi != null) {
            return ResponseEntity.ok(updatedApi);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Delete API
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApi(@PathVariable Long id) {
        apiService.deleteApi(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get API statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Object> getApiStats() {
        List<ApiConfig> allApis = apiService.getAllApis();
        List<ApiConfig> activeApis = apiService.getActiveApis();
        
        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalApis", allApis.size());
        stats.put("activeApis", activeApis.size());
        stats.put("inactiveApis", allApis.size() - activeApis.size());
        
        return ResponseEntity.ok(stats);
    }
}
