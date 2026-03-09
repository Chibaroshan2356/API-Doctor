package com.apidoctor.api_doctor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiDoctorApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiDoctorApplication.class, args);
    }
}