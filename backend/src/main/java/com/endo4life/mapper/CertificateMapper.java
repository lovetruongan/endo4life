package com.endo4life.mapper;

import com.endo4life.domain.document.Certificate;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CertificateResponseDto;
import com.endo4life.web.rest.model.CertificateType;
import com.endo4life.web.rest.model.CreateCertificateRequestDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper(componentModel = "spring")
public abstract class CertificateMapper {

    @Autowired
    protected MinioService minioService;

    @Autowired
    protected MinioProperties minioProperties;

    @Mapping(target = "type", source = "certificate.type", qualifiedByName = "mapCertificateType")
    @Mapping(target = "fileUrl", source = "certificate.filePath", qualifiedByName = "filePathToUrl")
    @Mapping(target = "previewImageUrl", source = "certificate.previewImagePath", qualifiedByName = "filePathToUrl")
    @Mapping(target = "userId", source = "certificate.user.id")
    @Mapping(target = "courseId", source = "certificate.course.id")
    @Mapping(target = "courseName", source = "certificate.course.title")
    @Mapping(target = "issuedAt", source = "certificate.issuedAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "expiresAt", source = "certificate.expiresAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "createdAt", source = "certificate.createdAt", qualifiedByName = "toOffsetDateTime")
    public abstract CertificateResponseDto toCertificateResponseDto(Certificate certificate);

    @Named("mapCertificateType")
    public CertificateType mapCertificateType(Certificate.CertificateType type) {
        if (type == null) {
            return null;
        }
        return CertificateType.valueOf(type.name());
    }

    @Named("filePathToUrl")
    public String filePathToUrl(String filePath) {
        if (StringUtils.isBlank(filePath)) {
            return null;
        }
        try {
            // Certificates are stored in the "other" bucket
            String bucketName = minioProperties.getBucketOther();
            return minioService.createGetPreSignedLink(filePath, bucketName);
        } catch (Exception e) {
            return null;
        }
    }

    @Named("toOffsetDateTime")
    public OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

    public CreateCertificateRequestDto toCreateCertificateRequestDto(
            String title, String description, String filePath, 
            LocalDateTime expiresAt, String userId) {
        CreateCertificateRequestDto dto = new CreateCertificateRequestDto();
        dto.setTitle(title);
        dto.setDescription(description);
        dto.setFilePath(filePath);
        if (expiresAt != null) {
            dto.setExpiresAt(expiresAt.atOffset(ZoneOffset.UTC));
        }
        if (userId != null) {
            dto.setUserId(java.util.UUID.fromString(userId));
        }
        return dto;
    }
}

