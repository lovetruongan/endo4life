package com.endo4life.repository;

import com.endo4life.domain.document.UserProgressCourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProgressCourseSectionRepository
        extends JpaRepository<UserProgressCourseSection, UUID>, JpaSpecificationExecutor<UserProgressCourseSection> {
    Optional<UserProgressCourseSection> findByUserRegistrationCourseIdAndCourseSectionId(UUID userRegistrationCourseId,
            UUID courseSectionId);
}
