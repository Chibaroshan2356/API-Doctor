package com.apidoctor.api_doctor.dto;

import java.time.LocalDateTime;

public class ApiChartDTO {

    private LocalDateTime time;
    private Double avgResponseTime;

    public ApiChartDTO(LocalDateTime time, Double avgResponseTime) {
        this.time = time;
        this.avgResponseTime = avgResponseTime;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public Double getAvgResponseTime() {
        return avgResponseTime;
    }
}