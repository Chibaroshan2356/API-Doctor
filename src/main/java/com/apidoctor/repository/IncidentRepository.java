package com.apidoctor.repository;

import com.apidoctor.api_doctor.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    
    // Find all incidents ordered by start time descending
    List<Incident> findAllByOrderByStartTimeDesc();
    
    // Find active incidents for a specific API
    List<Incident> findByApiIdAndStatus(String apiId, Incident.IncidentStatus status);
    
    // Find all active incidents
    List<Incident> findByStatus(Incident.IncidentStatus status);
    
    // Find incidents by API ID
    List<Incident> findByApiIdOrderByStartTimeDesc(String apiId);
    
    // Find incidents by API ID and status
    List<Incident> findByApiIdAndStatusOrderByStartTimeDesc(String apiId, Incident.IncidentStatus status);
    
    // Find incidents by severity
    List<Incident> findBySeverity(Incident.IncidentSeverity severity);
    
    // Find incidents within a time range
    @Query("SELECT i FROM Incident i WHERE i.startTime BETWEEN :startDate AND :endDate ORDER BY i.startTime DESC")
    List<Incident> findByStartTimeBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    // Find incidents by API within a time range
    @Query("SELECT i FROM Incident i WHERE i.apiId = :apiId AND i.startTime BETWEEN :startDate AND :endDate ORDER BY i.startTime DESC")
    List<Incident> findByApiIdAndStartTimeBetween(@Param("apiId") String apiId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
    
    // Get incident statistics
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = :status")
    Long countByStatus(@Param("status") Incident.IncidentStatus status);
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.severity = :severity")
    Long countBySeverity(@Param("severity") Incident.IncidentSeverity severity);
    
    @Query("SELECT i.severity, COUNT(i) FROM Incident i GROUP BY i.severity")
    List<Object[]> countBySeverityGrouped();
    
    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countByStatusGrouped();
    
    // Get average duration for resolved incidents
    @Query("SELECT AVG(i.durationMinutes) FROM Incident i WHERE i.status = 'RESOLVED' AND i.durationMinutes IS NOT NULL")
    Double getAverageDurationMinutes();
    
    // Find the most recent active incident for an API
    @Query("SELECT i FROM Incident i WHERE i.apiId = :apiId AND i.status = 'ACTIVE' ORDER BY i.startTime DESC")
    Optional<Incident> findMostRecentActiveIncidentByApiId(@Param("apiId") String apiId);
    
    // Check if API has active incident
    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Incident i WHERE i.apiId = :apiId AND i.status = 'ACTIVE'")
    boolean hasActiveIncident(@Param("apiId") String apiId);
    
    // Find incidents created in the last N hours
    @Query("SELECT i FROM Incident i WHERE i.createdAt >= :since ORDER BY i.startTime DESC")
    List<Incident> findRecentIncidents(@Param("since") LocalDateTime since);
    
    // Get incident count by API
    @Query("SELECT i.apiId, i.apiName, COUNT(i) FROM Incident i GROUP BY i.apiId, i.apiName ORDER BY COUNT(i) DESC")
    List<Object[]> getIncidentCountByApi();
    
    // Find incidents with description containing keyword
    @Query("SELECT i FROM Incident i WHERE LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY i.startTime DESC")
    List<Incident> findByDescriptionContaining(@Param("keyword") String keyword);
}
