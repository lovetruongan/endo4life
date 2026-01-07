package com.endo4life.web.rest.delegate;

import com.endo4life.domain.document.Certificate;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.mapper.CertificateMapper;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.security.RoleAccess;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.certificate.CertificateService;
import com.endo4life.web.rest.api.CertificateV1ApiDelegate;
import com.endo4life.web.rest.model.CertificateResponseDto;
import com.endo4life.web.rest.model.CertificateType;
import com.endo4life.web.rest.model.CreateCertificateRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateV1ApiDelegateImpl implements CertificateV1ApiDelegate {

    private final CertificateService certificateService;
    private final CertificateMapper certificateMapper;
    private final UserInfoRepository userInfoRepository;

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<List<CertificateResponseDto>> getUserCertificates(
            UUID userId, CertificateType type) {
        log.info("Getting certificates for user: {}, type: {}", userId, type);

        // Get current user's UserInfo.id (database ID)
        UUID currentUserInfoId = getCurrentUserInfoId();
        UUID targetUserId = userId != null ? userId : currentUserInfoId;
        
        // Check permission: only admin/coordinator can view other users' certificates
        if (!targetUserId.equals(currentUserInfoId) && !UserContextHolder.hasAnyAuthorities("ADMIN", "COORDINATOR")) {
            throw new AccessDeniedException("Cannot view other users' certificates");
        }

        List<Certificate> certificates;
        if (type != null) {
            Certificate.CertificateType entityType = Certificate.CertificateType.valueOf(type.name());
            certificates = certificateService.getUserCertificatesByType(targetUserId, entityType);
        } else {
            certificates = certificateService.getUserCertificates(targetUserId);
        }

        List<CertificateResponseDto> response = certificates.stream()
                .map(certificateMapper::toCertificateResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Override
    @RoleAccess.Authenticated // Users can upload their professional certs
    public ResponseEntity<IdWrapperDto> createProfessionalCertificate(
            CreateCertificateRequestDto createCertificateRequestDto) {
        log.info("Creating professional certificate: {}", createCertificateRequestDto.getTitle());

        // If userId not provided, use current user
        UUID targetUserId = createCertificateRequestDto.getUserId() != null
                ? createCertificateRequestDto.getUserId()
                : getCurrentUserInfoId();

        LocalDateTime expiresAt = createCertificateRequestDto.getExpiresAt() != null
                ? createCertificateRequestDto.getExpiresAt().toLocalDateTime()
                : null;

        Certificate certificate = certificateService.createProfessionalCertificate(
                targetUserId,
                createCertificateRequestDto.getTitle(),
                createCertificateRequestDto.getDescription(),
                createCertificateRequestDto.getFilePath(),
                createCertificateRequestDto.getFileType(),
                expiresAt
        );

        IdWrapperDto response = new IdWrapperDto();
        response.setId(certificate.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<CertificateResponseDto> getCertificateById(UUID id) {
        log.info("Getting certificate by ID: {}", id);

        Certificate certificate = certificateService.getCertificateById(id);
        CertificateResponseDto response = certificateMapper.toCertificateResponseDto(certificate);

        return ResponseEntity.ok(response);
    }

    @Override
    @RoleAccess.StaffOnly // ADMIN, SPECIALIST, COORDINATOR
    public ResponseEntity<Void> deleteCertificate(UUID id) {
        log.info("Deleting certificate: {}", id);

        certificateService.deleteCertificate(id);

        return ResponseEntity.noContent().build();
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<CertificateResponseDto> getCourseCertificate(UUID courseId, UUID userId) {
        log.info("Getting course certificate for courseId: {}, userId: {}", courseId, userId);

        UUID currentUserInfoId = getCurrentUserInfoId();
        UUID targetUserId = userId != null ? userId : currentUserInfoId;
        
        // Check permission
        if (!targetUserId.equals(currentUserInfoId) && !UserContextHolder.hasAnyAuthorities("ADMIN", "COORDINATOR")) {
            throw new AccessDeniedException("Cannot view other users' certificates");
        }

        Certificate certificate = certificateService.getOrGenerateCourseCertificate(targetUserId, courseId);
        return ResponseEntity.ok(certificateMapper.toCertificateResponseDto(certificate));
    }

    /**
     * Get the current user's UserInfo.id (database ID), not Keycloak UUID
     */
    private UUID getCurrentUserInfoId() {
        UUID keycloakUserId = UserContextHolder.getUserId()
                .map(UUID::fromString)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        
        return userInfoRepository.findByUserId(keycloakUserId)
                .map(UserInfo::getId)
                .orElseThrow(() -> new RuntimeException("UserInfo not found for user: " + keycloakUserId));
    }
}

