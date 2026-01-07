package com.endo4life.service.certificate;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Certificate;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.errors.UserNotFoundException;
import com.endo4life.repository.CertificateRepository;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.UserRegistrationCourseRepository;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.service.minio.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;
    private final CourseRepository courseRepository;
    private final CertificateGeneratorService certificateGeneratorService;
    private final MinioService minioService;
    private final MinioProperties minioProperties;

    @Override
    @Transactional
    public Certificate createProfessionalCertificate(UUID userId, String title, String description,
            String filePath, String fileType, LocalDateTime expiresAt) {
        log.info("Creating professional certificate for user: {} with fileType: {}", userId, fileType);

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        String previewImagePath = null;

        // Generate preview image if the uploaded file is a PDF
        if (fileType != null && fileType.equalsIgnoreCase("application/pdf")) {
            try {
                log.info("Generating preview image for PDF certificate: {}", filePath);

                // Download PDF from MinIO
                InputStream pdfStream = minioService.getFile(minioProperties.getBucketOther(), filePath);
                byte[] pdfBytes = pdfStream.readAllBytes();
                pdfStream.close();

                // Convert to PNG preview
                byte[] previewBytes = certificateGeneratorService.convertPdfToImage(pdfBytes);

                // Upload preview to MinIO
                String previewFileName = "preview-" + filePath.replace(".pdf", ".png");
                MultipartFile previewFile = new MockMultipartFile(
                        previewFileName,
                        previewFileName,
                        "image/png",
                        new ByteArrayInputStream(previewBytes));
                String previewObjectKey = UUID.randomUUID().toString() + ".png";
                minioService.uploadChunk(previewFile, minioProperties.getBucketOther(), previewObjectKey);
                previewImagePath = previewObjectKey;

                log.info("Preview image generated and uploaded: {}", previewObjectKey);
            } catch (Exception e) {
                log.warn("Failed to generate preview for PDF certificate: {}. Certificate will have no preview.",
                        e.getMessage());
                // Continue without preview - not critical
            }
        } else if (fileType != null && fileType.startsWith("image/")) {
            // If it's already an image, use it as the preview
            previewImagePath = filePath;
            log.info("Using uploaded image as preview: {}", filePath);
        }

        Certificate certificate = Certificate.builder()
                .title(title)
                .description(description)
                .type(Certificate.CertificateType.PROFESSIONAL)
                .filePath(filePath)
                .previewImagePath(previewImagePath)
                .user(user)
                .issuedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .isDeleted(Boolean.FALSE)
                .build();

        certificate.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        certificate.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        Certificate saved = certificateRepository.save(certificate);
        log.info("Professional certificate created with ID: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Certificate generateCourseCompletionCertificate(UserInfo user, Course course) {
        log.info("Generating course completion certificate for user: {} and course: {}",
                user.getId(), course.getId());

        // Check if certificate already exists
        if (hasCourseCertificate(user.getId(), course.getId())) {
            log.warn("Course completion certificate already exists for user: {} and course: {}",
                    user.getId(), course.getId());
            return getCourseCertificate(user.getId(), course.getId());
        }

        LocalDateTime issuedAt = LocalDateTime.now();
        String certificateTitle = String.format("Chứng chỉ hoàn thành - %s", course.getTitle());
        String certificateDescription = String.format(
                "Chứng nhận %s %s đã hoàn thành xuất sắc khóa học '%s'",
                user.getFirstName(), user.getLastName(), course.getTitle());

        try {
            // Generate certificate PDF and preview image
            CertificateGeneratorService.CertificateFiles certificateFiles = certificateGeneratorService
                    .generateCertificateWithPreview(user, course, issuedAt);

            // Upload PDF to MinIO (OTHER bucket)
            String pdfFileName = String.format("course-certificate-%s-%s.pdf", user.getId(), course.getId());
            MultipartFile pdfFile = new MockMultipartFile(
                    pdfFileName,
                    pdfFileName,
                    "application/pdf",
                    new ByteArrayInputStream(certificateFiles.getPdfBytes()));
            String pdfObjectKey = UUID.randomUUID().toString() + ".pdf";
            minioService.uploadChunk(pdfFile, minioProperties.getBucketOther(), pdfObjectKey);
            log.info("Certificate PDF uploaded to MinIO with key: {}", pdfObjectKey);

            // Upload preview image to MinIO (OTHER bucket)
            String previewFileName = String.format("course-certificate-preview-%s-%s.png", user.getId(),
                    course.getId());
            MultipartFile previewFile = new MockMultipartFile(
                    previewFileName,
                    previewFileName,
                    "image/png",
                    new ByteArrayInputStream(certificateFiles.getPreviewImageBytes()));
            String previewObjectKey = UUID.randomUUID().toString() + ".png";
            minioService.uploadChunk(previewFile, minioProperties.getBucketOther(), previewObjectKey);
            log.info("Certificate preview image uploaded to MinIO with key: {}", previewObjectKey);

            // Create certificate record with both file paths
            Certificate certificate = Certificate.builder()
                    .title(certificateTitle)
                    .description(certificateDescription)
                    .type(Certificate.CertificateType.COURSE_COMPLETION)
                    .filePath(pdfObjectKey) // Real MinIO object key for PDF
                    .previewImagePath(previewObjectKey) // MinIO object key for preview image
                    .user(user)
                    .course(course)
                    .issuedAt(issuedAt)
                    .expiresAt(null) // Course certificates don't expire
                    .isDeleted(Boolean.FALSE)
                    .build();

            certificate.setCreatedBy(Constants.SYSTEM);
            certificate.setUpdatedBy(Constants.SYSTEM);

            Certificate saved = certificateRepository.save(certificate);
            log.info("Course completion certificate generated with ID: {} and uploaded to MinIO", saved.getId());
            return saved;

        } catch (Exception e) {
            log.error("Failed to generate or upload certificate PDF for user {} and course {}: {}",
                    user.getId(), course.getId(), e.getMessage(), e);
            throw new BadRequestException("Failed to generate certificate: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Certificate> getUserCertificates(UUID userId) {
        log.debug("Fetching all certificates for user: {}", userId);
        return certificateRepository.findByUserIdAndNotDeleted(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Certificate> getUserCertificatesByType(UUID userId, Certificate.CertificateType type) {
        log.debug("Fetching {} certificates for user: {}", type, userId);
        return certificateRepository.findByUserIdAndTypeAndNotDeleted(userId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public Certificate getCertificateById(UUID certificateId) {
        log.debug("Fetching certificate by ID: {}", certificateId);
        return certificateRepository.findById(certificateId)
                .filter(cert -> !Boolean.TRUE.equals(cert.getIsDeleted()))
                .orElseThrow(() -> new BadRequestException("Certificate not found with id: " + certificateId));
    }

    @Override
    @Transactional
    public void deleteCertificate(UUID certificateId) {
        log.info("Soft deleting certificate: {}", certificateId);

        Certificate certificate = getCertificateById(certificateId);

        if (certificate.getType() == Certificate.CertificateType.COURSE_COMPLETION) {
            throw new BadRequestException("Course completion certificates cannot be deleted");
        }

        certificate.setIsDeleted(Boolean.TRUE);
        certificate.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        certificateRepository.save(certificate);

        log.info("Certificate soft deleted: {}", certificateId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCourseCertificate(UUID userId, UUID courseId) {
        return certificateRepository.existsByCourseIdAndUserIdAndNotDeleted(courseId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Certificate getCourseCertificate(UUID userId, UUID courseId) {
        List<Certificate> certificates = certificateRepository
                .findByCourseIdAndUserIdAndNotDeleted(courseId, userId);

        if (certificates.isEmpty()) {
            throw new BadRequestException(
                    String.format("Course certificate not found for user: %s and course: %s", userId, courseId));
        }

        return certificates.get(0);
    }

    @Override
    @Transactional
    public Certificate getOrGenerateCourseCertificate(UUID userId, UUID courseId) {
        // Return existing certificate if found
        if (hasCourseCertificate(userId, courseId)) {
            return getCourseCertificate(userId, courseId);
        }

        // Check if course is complete
        UserRegistrationCourse registration = userRegistrationCourseRepository
                .findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new BadRequestException("User not enrolled in course"));

        if (!Boolean.TRUE.equals(registration.getIsCompletedCourse())) {
            throw new BadRequestException("Course not completed yet");
        }

        // Auto-generate certificate
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("UserInfo not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BadRequestException("Course not found"));

        Certificate certificate = generateCourseCompletionCertificate(userInfo, course);
        registration.setCourseCertificateId(certificate.getId());
        userRegistrationCourseRepository.save(registration);

        log.info("Auto-generated certificate {} for user {} course {}", certificate.getId(), userId, courseId);
        return certificate;
    }
}
