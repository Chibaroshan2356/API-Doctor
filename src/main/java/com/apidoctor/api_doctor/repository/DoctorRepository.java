package com.apidoctor.api_doctor.repository;

import com.apidoctor.api_doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
