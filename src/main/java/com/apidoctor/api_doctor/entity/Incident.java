package com.apidoctor.api_doctor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
public class Incident {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String apiName;
    
    @Column(nullable = false)
    private String apiId;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSeverity severity;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum IncidentStatus {
        ACTIVE,
        RESOLVED
    }
    
    public enum IncidentSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
    
    // Constructors
    public Incident() {
        this.status = IncidentStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Incident(String apiName, String apiId, IncidentSeverity severity, String description) {
        this();
        this.apiName = apiName;
        this.apiId = apiId;
        this.severity = severity;
        this.description = description;
        this.startTime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getApiName() {
        return apiName;
    }
    
    public void setApiName(String apiName) {
        this.apiName = apiName;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getApiId() {
        return apiId;
    }
    
    public void setApiId(String apiId) {
        this.apiId = apiId;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public IncidentStatus getStatus() {
        return status;
    }
    
    public void setStatus(IncidentStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }
    
    public IncidentSeverity getSeverity() {
        return severity;
    }
    
    public void setSeverity(IncidentSeverity severity) {
        this.severity = severity;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Business methods
    public void closeIncident() {
        this.endTime = LocalDateTime.now();
        this.status = IncidentStatus.RESOLVED;
        if (this.startTime != null && this.endTime != null) {
            this.durationMinutes = (int) java.time.Duration.between(this.startTime, this.endTime).toMinutes();
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
