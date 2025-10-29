package com.endo4life.repository;

import com.endo4life.domain.document.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, UUID>, JpaSpecificationExecutor<Test> {
    List<Test> findByCourseId(UUID courseId);

    List<Test> findByCourseIdAndType(UUID courseId, String type);
}