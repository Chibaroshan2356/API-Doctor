package com.apidoctor.api_doctor.dto;

public class ApiUptimeDTO {

    private String apiName;
    private double uptime;

    public ApiUptimeDTO(String apiName, double uptime) {
        this.apiName = apiName;
        this.uptime = uptime;
    }

    public String getApiName() {
        return apiName;
    }

    public double getUptime() {
        return uptime;
    }
}