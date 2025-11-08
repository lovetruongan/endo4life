package com.endo4life.repository;

import com.endo4life.domain.document.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    @Query("SELECT c FROM Certificate c WHERE c.user.id = :userId AND c.isDeleted = false ORDER BY c.issuedAt DESC")
    List<Certificate> findByUserIdAndNotDeleted(@Param("userId") UUID userId);

    @Query("SELECT c FROM Certificate c WHERE c.user.id = :userId AND c.type = :type AND c.isDeleted = false ORDER BY c.issuedAt DESC")
    List<Certificate> findByUserIdAndTypeAndNotDeleted(@Param("userId") UUID userId, @Param("type") Certificate.CertificateType type);

    @Query("SELECT c FROM Certificate c WHERE c.course.id = :courseId AND c.user.id = :userId AND c.isDeleted = false")
    List<Certificate> findByCourseIdAndUserIdAndNotDeleted(@Param("courseId") UUID courseId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(c) > 0 FROM Certificate c WHERE c.course.id = :courseId AND c.user.id = :userId AND c.isDeleted = false")
    boolean existsByCourseIdAndUserIdAndNotDeleted(@Param("courseId") UUID courseId, @Param("userId") UUID userId);
}

