package com.apidoctor.api_doctor.dto;

public class DashboardDTO {

    private String apiName;
    private String status;
    private double avgResponseTime;
    private double uptime;

    public DashboardDTO(String apiName, String status, double avgResponseTime, double uptime) {
        this.apiName = apiName;
        this.status = status;
        this.avgResponseTime = avgResponseTime;
        this.uptime = uptime;
    }

    public String getApiName() {
        return apiName;
    }

    public String getStatus() {
        return status;
    }

    public double getAvgResponseTime() {
        return avgResponseTime;
    }

    public double getUptime() {
        return uptime;
    }
}