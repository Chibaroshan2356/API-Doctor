package com.apidoctor.api_doctor.dto;

public class ApiMetricSummary {

    private String apiName;
    private Double avgResponseTime;
    private Long totalChecks;
    private Long successCount;

    public ApiMetricSummary(String apiName, Double avgResponseTime, Long totalChecks, Long successCount) {
        this.apiName = apiName;
        this.avgResponseTime = avgResponseTime;
        this.totalChecks = totalChecks;
        this.successCount = successCount;
    }

    public String getApiName() {
        return apiName;
    }

    public Double getAvgResponseTime() {
        return avgResponseTime;
    }

    public Long getTotalChecks() {
        return totalChecks;
    }

    public Long getSuccessCount() {
        return successCount;
    }
}