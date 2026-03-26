package com.apidoctor.controller;

import com.apidoctor.dto.ApiStatusDto;
import com.apidoctor.service.HealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:5174")
public class HealthCheckController {
    
    @Autowired
    private HealthCheckService healthCheckService;
    
    /**
     * Check health of all APIs
     */
    @GetMapping
    public ResponseEntity<List<ApiStatusDto>> checkAllApisHealth() {
        List<ApiStatusDto> statuses = healthCheckService.checkAllApisHealth();
        return ResponseEntity.ok(statuses);
    }
    
    /**
     * Check health of specific API by ID
     */
    @GetMapping("/{apiId}")
    public ResponseEntity<ApiStatusDto> checkApiHealth(@PathVariable Long apiId) {
        ApiStatusDto status = healthCheckService.checkApiHealthById(apiId);
        if (status != null) {
            return ResponseEntity.ok(status);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Check health of specific API by name
     */
    @GetMapping("/name/{apiName}")
    public ResponseEntity<ApiStatusDto> checkApiHealthByName(@PathVariable String apiName) {
        // This would require adding a method to find API by name
        // For now, return not found
        return ResponseEntity.notFound().build();
    }
}
