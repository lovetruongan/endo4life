package com.endo4life.domain.document;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "certificate")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Certificate extends AbstractEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private CertificateType type;

    @Column(name = "file_path", nullable = false)
    private String filePath; // MinIO object key (UUID) for PDF

    @Column(name = "preview_image_path")
    private String previewImagePath; // MinIO object key for preview PNG image

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_info_id", nullable = false)
    private UserInfo user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course; // Only for COURSE_COMPLETION type

    @Column(name = "is_deleted")
    private Boolean isDeleted = Boolean.FALSE;

    public enum CertificateType {
        PROFESSIONAL,       // Uploaded by user/admin (medical license, diploma, etc.)
        COURSE_COMPLETION   // Generated when user completes a course
    }
}

