package com.endo4life.service.usertest;

import com.endo4life.web.rest.model.*;

import java.util.UUID;

public interface UserTestService {

    /**
     * Get test questions for student (without correct answers)
     */
    StudentTestDto getTestQuestions(UUID testId, UUID userInfoId);

    /**
     * Submit test answers and auto-grade
     */
    TestResultDto submitTestAnswers(UUID testId, TestSubmissionDto submission);

    /**
     * Get test result with correct answers shown
     */
    TestResultDto getTestResult(UUID testId, UUID userInfoId);

    /**
     * Get entrance test for a course
     */
    StudentTestDto getEntranceTest(UUID courseId, UUID userInfoId);

    /**
     * Get lecture review test
     */
    StudentTestDto getLectureReviewTest(UUID lectureId, UUID userInfoId);

    /**
     * Get final exam for a course
     */
    StudentTestDto getFinalExam(UUID courseId, UUID userInfoId);
}

