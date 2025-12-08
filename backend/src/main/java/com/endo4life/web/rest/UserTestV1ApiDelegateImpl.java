package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.usertest.UserTestService;
import com.endo4life.web.rest.api.UserTestV1ApiDelegate;
import com.endo4life.web.rest.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@RoleAccess.Authenticated // All methods require authentication
public class UserTestV1ApiDelegateImpl implements UserTestV1ApiDelegate {

    private final UserTestService userTestService;

    @Override
    public ResponseEntity<StudentTestDto> getStudentTestQuestions(UUID testId, UUID userInfoId) {
        log.info("Getting test questions for testId: {} and userInfoId: {}", testId, userInfoId);
        StudentTestDto testDto = userTestService.getTestQuestions(testId, userInfoId);
        return ResponseEntity.ok(testDto);
    }

    @Override
    public ResponseEntity<TestResultDto> submitStudentTest(UUID testId, TestSubmissionDto testSubmissionDto) {
        log.info("Submitting test: {} for userInfoId: {}", testId, testSubmissionDto.getUserInfoId());
        TestResultDto result = userTestService.submitTestAnswers(testId, testSubmissionDto);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<TestResultDto> getStudentTestResult(UUID testId, UUID userInfoId) {
        log.info("Getting test result for testId: {} and userInfoId: {}", testId, userInfoId);
        TestResultDto result = userTestService.getTestResult(testId, userInfoId);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<StudentTestDto> getCourseEntranceTest(UUID courseId, UUID userInfoId) {
        log.info("Getting entrance test for courseId: {} and userInfoId: {}", courseId, userInfoId);
        StudentTestDto testDto = userTestService.getEntranceTest(courseId, userInfoId);
        return ResponseEntity.ok(testDto);
    }

    @Override
    public ResponseEntity<StudentTestDto> getLectureReviewTest(UUID lectureId, UUID userInfoId) {
        log.info("Getting lecture review test for lectureId: {} and userInfoId: {}", lectureId, userInfoId);
        StudentTestDto testDto = userTestService.getLectureReviewTest(lectureId, userInfoId);
        return ResponseEntity.ok(testDto);
    }

    @Override
    public ResponseEntity<StudentTestDto> getCourseFinalExam(UUID courseId, UUID userInfoId) {
        log.info("Getting final exam for courseId: {} and userInfoId: {}", courseId, userInfoId);
        StudentTestDto testDto = userTestService.getFinalExam(courseId, userInfoId);
        return ResponseEntity.ok(testDto);
    }
}

