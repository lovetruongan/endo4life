package com.endo4life.repository;

import com.endo4life.domain.document.Test;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserTestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserTestSubmissionRepository extends JpaRepository<UserTestSubmission, UUID> {

    /**
     * Find all submissions for a specific test by a specific user
     */
    List<UserTestSubmission> findByTestAndUserInfoOrderByCreatedAtDesc(Test test, UserInfo userInfo);

    /**
     * Find the latest submission for a test by a user
     */
    Optional<UserTestSubmission> findFirstByTestAndUserInfoOrderByCreatedAtDesc(Test test, UserInfo userInfo);

    /**
     * Count submissions for a test by a user
     */
    long countByTestAndUserInfo(Test test, UserInfo userInfo);

    /**
     * Find the latest passing submission
     */
    @Query("SELECT uts FROM UserTestSubmission uts WHERE uts.test = :test AND uts.userInfo = :userInfo AND uts.passed = true ORDER BY uts.createdAt DESC")
    Optional<UserTestSubmission> findLatestPassingSubmission(@Param("test") Test test, @Param("userInfo") UserInfo userInfo);

    /**
     * Check if user has passed a test
     */
    @Query("SELECT CASE WHEN COUNT(uts) > 0 THEN true ELSE false END FROM UserTestSubmission uts WHERE uts.test = :test AND uts.userInfo = :userInfo AND uts.passed = true")
    boolean hasUserPassedTest(@Param("test") Test test, @Param("userInfo") UserInfo userInfo);
}

