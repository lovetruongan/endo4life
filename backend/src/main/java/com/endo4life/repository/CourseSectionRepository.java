package com.endo4life.repository;

import com.endo4life.domain.document.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseSectionRepository
        extends JpaRepository<CourseSection, UUID>, JpaSpecificationExecutor<CourseSection> {
}
