package com.apidoctor.api_doctor.repository;

import com.apidoctor.api_doctor.dto.ApiChartDTO;
import com.apidoctor.api_doctor.dto.ApiHistoryDTO;
import com.apidoctor.api_doctor.dto.ApiMetricSummary;
import com.apidoctor.api_doctor.dto.ApiUptimeDTO;
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

    @Query("""
                SELECT m FROM ApiMetric m
                WHERE m.checkedAt = (
                    SELECT MAX(m2.checkedAt)
                    FROM ApiMetric m2
                    WHERE m2.apiName = m.apiName
                )
            """)
    List<ApiMetric> findLatestMetrics();

    @Query("""
                    SELECT new com.apidoctor.api_doctor.dto.ApiUptimeDTO(
                        m.apiName,
                        (SUM(CASE WHEN m.success = true THEN 1 ELSE 0 END) * 100.0) / COUNT(m)
                    )
                    FROM ApiMetric m
                    GROUP BY m.apiName
            """)
    List<ApiUptimeDTO> getApiUptime();

    @Query("""
                    SELECT m FROM ApiMetric m
                    WHERE m.apiName = :apiName
                    ORDER BY m.checkedAt DESC
            """)
    List<ApiMetric> findLastMetricsByApi(String apiName);

    @Query("""
                    SELECT m.apiName, AVG(m.responseTimeMs)
                    FROM ApiMetric m
                    GROUP BY m.apiName
            """)
    List<Object[]> getAverageResponseTimes();

    @Query("""
                    SELECT new com.apidoctor.api_doctor.dto.ApiHistoryDTO(
                        m.checkedAt,
                        m.responseTimeMs
                    )
                    FROM ApiMetric m
                    WHERE m.apiName = :apiName
                    ORDER BY m.checkedAt DESC
            """)
    List<ApiHistoryDTO> getApiHistory(String apiName);

    @Query("""
                   SELECT new com.apidoctor.api_doctor.dto.ApiChartDTO(
                       m.checkedAt,
                       AVG(m.responseTimeMs)
                   )
                   FROM ApiMetric m
                   WHERE m.apiName = :apiName
                   GROUP BY m.checkedAt
                   ORDER BY m.checkedAt DESC
            """)
    List<ApiChartDTO> getChartData(String apiName);
}