package com.apidoctor.service;

import com.apidoctor.api_doctor.entity.Incident;
import com.apidoctor.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class IncidentService {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    /**
     * Get all incidents
     */
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByStartTimeDesc();
    }
    
    /**
     * Get incidents by API ID
     */
    public List<Incident> getIncidentsByApiId(String apiId) {
        return incidentRepository.findByApiIdOrderByStartTimeDesc(apiId);
    }
    
    /**
     * Get active incidents
     */
    public List<Incident> getActiveIncidents() {
        return incidentRepository.findByStatus(Incident.IncidentStatus.ACTIVE);
    }
    
    /**
     * Get active incidents for a specific API
     */
    public List<Incident> getActiveIncidentsByApiId(String apiId) {
        return incidentRepository.findByApiIdAndStatus(apiId, Incident.IncidentStatus.ACTIVE);
    }
    
    /**
     * Start a new incident
     */
    public Incident startIncident(String apiName, String apiId, 
                                Incident.IncidentSeverity severity, 
                                String description) {
        // Check if there's already an active incident for this API
        Optional<Incident> existingActive = incidentRepository
            .findMostRecentActiveIncidentByApiId(apiId);
        
        if (existingActive.isPresent()) {
            throw new IllegalStateException("API " + apiName + " already has an active incident");
        }
        
        Incident incident = new Incident(apiName, apiId, severity, description);
        return incidentRepository.save(incident);
    }
    
    /**
     * Close an incident
     */
    public Incident closeIncident(Long incidentId) {
        Optional<Incident> incidentOpt = incidentRepository.findById(incidentId);
        if (incidentOpt.isEmpty()) {
            throw new IllegalArgumentException("Incident not found with ID: " + incidentId);
        }
        
        Incident incident = incidentOpt.get();
        if (incident.getStatus() == Incident.IncidentStatus.RESOLVED) {
            throw new IllegalStateException("Incident is already resolved");
        }
        
        incident.closeIncident();
        return incidentRepository.save(incident);
    }
    
    /**
     * Close active incident for an API
     */
    public Optional<Incident> closeActiveIncidentForApi(String apiId) {
        Optional<Incident> activeIncident = incidentRepository
            .findMostRecentActiveIncidentByApiId(apiId);
        
        if (activeIncident.isPresent()) {
            Incident incident = activeIncident.get();
            incident.closeIncident();
            return Optional.of(incidentRepository.save(incident));
        }
        
        return Optional.empty();
    }
    
    /**
     * Get incident statistics
     */
    public Map<String, Object> getIncidentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total counts
        Long totalIncidents = incidentRepository.count();
        Long activeIncidents = incidentRepository.countByStatus(Incident.IncidentStatus.ACTIVE);
        Long resolvedIncidents = incidentRepository.countByStatus(Incident.IncidentStatus.RESOLVED);
        
        stats.put("totalIncidents", totalIncidents);
        stats.put("activeIncidents", activeIncidents);
        stats.put("resolvedIncidents", resolvedIncidents);
        
        // Severity breakdown
        List<Object[]> severityCounts = incidentRepository.countBySeverityGrouped();
        Map<String, Long> severityBreakdown = new HashMap<>();
        for (Object[] row : severityCounts) {
            severityBreakdown.put(((Incident.IncidentSeverity) row[0]).name(), (Long) row[1]);
        }
        stats.put("severityBreakdown", severityBreakdown);
        
        // Status breakdown
        List<Object[]> statusCounts = incidentRepository.countByStatusGrouped();
        Map<String, Long> statusBreakdown = new HashMap<>();
        for (Object[] row : statusCounts) {
            statusBreakdown.put(((Incident.IncidentStatus) row[0]).name(), (Long) row[1]);
        }
        stats.put("statusBreakdown", statusBreakdown);
        
        // Average duration
        Double avgDuration = incidentRepository.getAverageDurationMinutes();
        stats.put("averageDurationMinutes", avgDuration != null ? avgDuration : 0);
        
        // API breakdown
        List<Object[]> apiCounts = incidentRepository.getIncidentCountByApi();
        List<Map<String, Object>> apiBreakdown = new ArrayList<>();
        for (Object[] row : apiCounts) {
            Map<String, Object> apiStat = new HashMap<>();
            apiStat.put("apiId", row[0]);
            apiStat.put("apiName", row[1]);
            apiStat.put("incidentCount", row[2]);
            apiBreakdown.add(apiStat);
        }
        stats.put("apiBreakdown", apiBreakdown);
        
        return stats;
    }
    
    /**
     * Get incidents within a time range
     */
    public List<Incident> getIncidentsByTimeRange(LocalDateTime startDate, LocalDateTime endDate) {
        return incidentRepository.findByStartTimeBetween(startDate, endDate);
    }
    
    /**
     * Get incidents for an API within a time range
     */
    public List<Incident> getIncidentsByApiAndTimeRange(String apiId, LocalDateTime startDate, LocalDateTime endDate) {
        return incidentRepository.findByApiIdAndStartTimeBetween(apiId, startDate, endDate);
    }
    
    /**
     * Get recent incidents (last 24 hours)
     */
    public List<Incident> getRecentIncidents() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return incidentRepository.findRecentIncidents(since);
    }
    
    /**
     * Check if API has active incident
     */
    public boolean hasActiveIncident(String apiId) {
        return incidentRepository.hasActiveIncident(apiId);
    }
    
    /**
     * Search incidents by description
     */
    public List<Incident> searchIncidentsByDescription(String keyword) {
        return incidentRepository.findByDescriptionContaining(keyword);
    }
    
    /**
     * Auto-incident management
     * This method should be called when API status changes
     */
    public void handleApiStatusChange(String apiId, String apiName, 
                                     String oldStatus, String newStatus) {
        // If API goes from healthy to down, start an incident
        if (isHealthyStatus(oldStatus) && isDownStatus(newStatus)) {
            try {
                startIncident(apiName, apiId, Incident.IncidentSeverity.HIGH, 
                             "API status changed from " + oldStatus + " to " + newStatus);
            } catch (IllegalStateException e) {
                // Incident already exists, ignore
                System.out.println("Incident already exists for API: " + apiName);
            }
        }
        
        // If API goes from down to healthy, close the incident
        if (isDownStatus(oldStatus) && isHealthyStatus(newStatus)) {
            closeActiveIncidentForApi(apiId).ifPresent(incident -> {
                System.out.println("Closed incident for API: " + apiName + 
                                 ", Duration: " + incident.getDurationMinutes() + " minutes");
            });
        }
    }
    
    private boolean isHealthyStatus(String status) {
        return "healthy".equalsIgnoreCase(status) || "up".equalsIgnoreCase(status);
    }
    
    private boolean isDownStatus(String status) {
        return "down".equalsIgnoreCase(status) || "unhealthy".equalsIgnoreCase(status);
    }
    
    /**
     * Get incident by ID
     */
    public Optional<Incident> getIncidentById(Long id) {
        return incidentRepository.findById(id);
    }
    
    /**
     * Update incident description
     */
    public Incident updateIncidentDescription(Long id, String description) {
        Optional<Incident> incidentOpt = incidentRepository.findById(id);
        if (incidentOpt.isEmpty()) {
            throw new IllegalArgumentException("Incident not found with ID: " + id);
        }
        
        Incident incident = incidentOpt.get();
        incident.setDescription(description);
        return incidentRepository.save(incident);
    }
    
    /**
     * Update incident severity
     */
    public Incident updateIncidentSeverity(Long id, Incident.IncidentSeverity severity) {
        Optional<Incident> incidentOpt = incidentRepository.findById(id);
        if (incidentOpt.isEmpty()) {
            throw new IllegalArgumentException("Incident not found with ID: " + id);
        }
        
        Incident incident = incidentOpt.get();
        incident.setSeverity(severity);
        return incidentRepository.save(incident);
    }
}
