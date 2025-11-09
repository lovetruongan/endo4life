package com.endo4life.service.certificate;

import com.endo4life.domain.document.Certificate;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.UserInfo;

import java.util.List;
import java.util.UUID;

public interface CertificateService {

    /**
     * Create a professional certificate for a user
     */
    Certificate createProfessionalCertificate(UUID userId, String title, String description, 
                                             String filePath, String fileType, java.time.LocalDateTime expiresAt);

    /**
     * Generate a course completion certificate for a user
     */
    Certificate generateCourseCompletionCertificate(UserInfo user, Course course);

    /**
     * Get all certificates for a user
     */
    List<Certificate> getUserCertificates(UUID userId);

    /**
     * Get certificates by type for a user
     */
    List<Certificate> getUserCertificatesByType(UUID userId, Certificate.CertificateType type);

    /**
     * Get certificate by ID
     */
    Certificate getCertificateById(UUID certificateId);

    /**
     * Delete certificate (soft delete)
     */
    void deleteCertificate(UUID certificateId);

    /**
     * Check if user already has a course completion certificate
     */
    boolean hasCourseCertificate(UUID userId, UUID courseId);

    /**
     * Get course completion certificate for a user
     */
    Certificate getCourseCertificate(UUID userId, UUID courseId);
}

