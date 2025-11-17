package com.endo4life.repository;

import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserRegistrationCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRegistrationCourseRepository
        extends JpaRepository<UserRegistrationCourse, UUID>, JpaSpecificationExecutor<UserRegistrationCourse> {
    Optional<UserRegistrationCourse> findByCourseIdAndUserId(UUID courseId, UUID userInfoId);

    List<UserRegistrationCourse> findByUserId(UUID userInfoId);

    List<UserRegistrationCourse> findByCourseId(UUID courseId);

    Optional<UserRegistrationCourse> findByCourseAndUser(Course course, UserInfo userInfo);
}
