package com.apidoctor.api_doctor.dto;

import java.time.LocalDateTime;

public class ApiHistoryDTO {

    private LocalDateTime checkedAt;
    private long responseTimeMs;

    public ApiHistoryDTO(LocalDateTime checkedAt, long responseTimeMs) {
        this.checkedAt = checkedAt;
        this.responseTimeMs = responseTimeMs;
    }

    public LocalDateTime getCheckedAt() {
        return checkedAt;
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }
}