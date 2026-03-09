package com.apidoctor.api_doctor.repository;

import com.apidoctor.api_doctor.entity.ApiConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApiConfigRepository extends JpaRepository<ApiConfig, Long> {

    List<ApiConfig> findByActiveTrue();

}