package com.apidoctor.api_doctor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.apidoctor")
@EnableJpaRepositories(basePackages = "com.apidoctor")
@EnableScheduling
public class ApiDoctorApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiDoctorApplication.class, args);
    }
}