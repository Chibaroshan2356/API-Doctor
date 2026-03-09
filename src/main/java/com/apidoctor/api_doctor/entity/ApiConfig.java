package com.apidoctor.api_doctor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "api_config")
public class ApiConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String url;
    private String method;

    @Column(name = "expected_status")
    private Integer expectedStatus;

    private Boolean active;

    @Column(name = "interval_seconds")
    private Integer intervalSeconds;
}