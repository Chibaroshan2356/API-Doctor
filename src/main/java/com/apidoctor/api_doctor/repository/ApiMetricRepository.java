package com.apidoctor.api_doctor.repository;

import com.apidoctor.api_doctor.dto.ApiMetricSummary;
import com.apidoctor.api_doctor.entity.ApiMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ApiMetricRepository extends JpaRepository<ApiMetric, Long> {

    @Query("""
                SELECT new com.apidoctor.api_doctor.dto.ApiMetricSummary(
                    m.apiName,
                    AVG(m.responseTimeMs),
                    COUNT(m),
                    SUM(CASE WHEN m.success = true THEN 1 ELSE 0 END)
                )
                FROM ApiMetric m
                GROUP BY m.apiName
            """)
    List<ApiMetricSummary> getApiSummary();

    // Latest API checks
    List<ApiMetric> findTop10ByOrderByCheckedAtDesc();
}