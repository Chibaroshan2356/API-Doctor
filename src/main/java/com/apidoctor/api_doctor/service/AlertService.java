package com.apidoctor.api_doctor.service;

import org.springframework.stereotype.Service;

@Service
public class AlertService {

    public void sendAlert(String apiName) {
        System.out.println("⚠ ALERT: API DOWN → " + apiName);
    }

    public void sendSlowAlert(String apiName, long responseTime) {
        System.out.println("⚠ SLOW API ALERT → " + apiName + " (" + responseTime + "ms)");
    }
}