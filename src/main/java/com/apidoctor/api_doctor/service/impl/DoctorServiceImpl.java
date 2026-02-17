package com.apidoctor.api_doctor.service.impl;

import com.apidoctor.api_doctor.entity.Doctor;
import com.apidoctor.api_doctor.repository.DoctorRepository;
import com.apidoctor.api_doctor.service.DoctorService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    @Override
    public Doctor updateDoctor(Long id, Doctor doctor) {
        Doctor existing = getDoctorById(id);

        existing.setName(doctor.getName());
        existing.setSpecialization(doctor.getSpecialization());
        existing.setEmail(doctor.getEmail());

        return doctorRepository.save(existing);
    }

    @Override
    public void deleteDoctor(Long id) {
        Doctor existing = getDoctorById(id);
        doctorRepository.delete(existing);
    }
}
