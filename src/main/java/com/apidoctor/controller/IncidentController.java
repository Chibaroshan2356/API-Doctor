package com.apidoctor.controller;

import com.apidoctor.api_doctor.entity.Incident;
import com.apidoctor.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "false")
public class IncidentController {
    
    @Autowired
    private IncidentService incidentService;
    
    /**
     * Get all incidents
     */
    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(
            @RequestParam(required = false) String apiId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "50") int limit) {
        
        List<Incident> incidents;
        
        if (apiId != null && !apiId.isEmpty()) {
            incidents = incidentService.getIncidentsByApiId(apiId);
        } else {
            incidents = incidentService.getAllIncidents();
        }
        
        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            Incident.IncidentStatus statusEnum = Incident.IncidentStatus.valueOf(status.toUpperCase());
            incidents = incidents.stream()
                .filter(inc -> inc.getStatus() == statusEnum)
                .toList();
        }
        
        // Filter by severity if provided
        if (severity != null && !severity.isEmpty()) {
            Incident.IncidentSeverity severityEnum = Incident.IncidentSeverity.valueOf(severity.toUpperCase());
            incidents = incidents.stream()
                .filter(inc -> inc.getSeverity() == severityEnum)
                .toList();
        }
        
        // Apply limit
        if (limit > 0 && incidents.size() > limit) {
            incidents = incidents.subList(0, limit);
        }
        
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Get incident by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable Long id) {
        Optional<Incident> incident = incidentService.getIncidentById(id);
        return incident.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get active incidents
     */
    @GetMapping("/active")
    public ResponseEntity<List<Incident>> getActiveIncidents(
            @RequestParam(required = false) String apiId) {
        
        List<Incident> incidents;
        if (apiId != null && !apiId.isEmpty()) {
            incidents = incidentService.getActiveIncidentsByApiId(apiId);
        } else {
            incidents = incidentService.getActiveIncidents();
        }
        
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Get incidents by API ID
     */
    @GetMapping("/api/{apiId}")
    public ResponseEntity<List<Incident>> getIncidentsByApi(@PathVariable String apiId) {
        List<Incident> incidents = incidentService.getIncidentsByApiId(apiId);
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Start a new incident
     */
    @PostMapping("/start")
    public ResponseEntity<?> startIncident(@RequestBody StartIncidentRequest request) {
        try {
            Incident incident = incidentService.startIncident(
                request.getApiName(),
                request.getApiId(),
                request.getSeverity(),
                request.getDescription()
            );
            return ResponseEntity.ok(incident);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Incident already exists",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to start incident",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Close an incident
     */
    @PostMapping("/end")
    public ResponseEntity<?> closeIncident(@RequestBody CloseIncidentRequest request) {
        try {
            Incident incident = incidentService.closeIncident(request.getIncidentId());
            return ResponseEntity.ok(incident);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Incident already resolved",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to close incident",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Close active incident for an API
     */
    @PostMapping("/end/{apiId}")
    public ResponseEntity<?> closeActiveIncidentForApi(@PathVariable String apiId) {
        Optional<Incident> incident = incidentService.closeActiveIncidentForApi(apiId);
        return incident.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get incident statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getIncidentStatistics() {
        Map<String, Object> stats = incidentService.getIncidentStatistics();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get incidents within time range
     */
    @GetMapping("/timerange")
    public ResponseEntity<List<Incident>> getIncidentsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String apiId) {
        
        List<Incident> incidents;
        if (apiId != null && !apiId.isEmpty()) {
            incidents = incidentService.getIncidentsByApiAndTimeRange(apiId, startDate, endDate);
        } else {
            incidents = incidentService.getIncidentsByTimeRange(startDate, endDate);
        }
        
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Get recent incidents (last 24 hours)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Incident>> getRecentIncidents() {
        List<Incident> incidents = incidentService.getRecentIncidents();
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Check if API has active incident
     */
    @GetMapping("/check/{apiId}")
    public ResponseEntity<Map<String, Object>> checkActiveIncident(@PathVariable String apiId) {
        boolean hasActive = incidentService.hasActiveIncident(apiId);
        Optional<Incident> activeIncident = incidentService.getActiveIncidentsByApiId(apiId)
            .stream()
            .findFirst();
        
        Map<String, Object> response = Map.of(
            "hasActiveIncident", hasActive,
            "activeIncident", activeIncident.orElse(null)
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search incidents by description
     */
    @GetMapping("/search")
    public ResponseEntity<List<Incident>> searchIncidents(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "20") int limit) {
        
        List<Incident> incidents = incidentService.searchIncidentsByDescription(keyword);
        
        if (limit > 0 && incidents.size() > limit) {
            incidents = incidents.subList(0, limit);
        }
        
        return ResponseEntity.ok(incidents);
    }
    
    /**
     * Update incident description
     */
    @PutMapping("/{id}/description")
    public ResponseEntity<Incident> updateIncidentDescription(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        try {
            Incident incident = incidentService.updateIncidentDescription(id, request.get("description"));
            return ResponseEntity.ok(incident);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Update incident severity
     */
    @PutMapping("/{id}/severity")
    public ResponseEntity<Incident> updateIncidentSeverity(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        try {
            Incident.IncidentSeverity severity = Incident.IncidentSeverity.valueOf(
                request.get("severity").toUpperCase()
            );
            Incident incident = incidentService.updateIncidentSeverity(id, severity);
            return ResponseEntity.ok(incident);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Request DTOs
    public static class StartIncidentRequest {
        private String apiName;
        private String apiId;
        private Incident.IncidentSeverity severity;
        private String description;
        
        // Getters and Setters
        public String getApiName() { return apiName; }
        public void setApiName(String apiName) { this.apiName = apiName; }
        
        public String getApiId() { return apiId; }
        public void setApiId(String apiId) { this.apiId = apiId; }
        
        public Incident.IncidentSeverity getSeverity() { return severity; }
        public void setSeverity(Incident.IncidentSeverity severity) { this.severity = severity; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class CloseIncidentRequest {
        private Long incidentId;
        
        public Long getIncidentId() { return incidentId; }
        public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }
    }
}
