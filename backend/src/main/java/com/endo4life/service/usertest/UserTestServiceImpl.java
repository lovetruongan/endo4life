package com.endo4life.service.usertest;

import com.endo4life.domain.document.*;
import com.endo4life.repository.*;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserTestServiceImpl implements UserTestService {

    private final TestRepository testRepository;
    private final UserInfoRepository userInfoRepository;
    private final CourseRepository courseRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final UserTestSubmissionRepository userTestSubmissionRepository;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;
    private final UserProgressCourseSectionRepository userProgressCourseSectionRepository;
    private final MinioService minioService;
    private final ObjectMapper objectMapper;

    private static final int DEFAULT_PASSING_SCORE = 70; // 70%

    @Override
    public StudentTestDto getTestQuestions(UUID testId, UUID userInfoId) {
        log.info("Getting test questions for testId: {} and userInfoId: {}", testId, userInfoId);

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + testId));

        // Verify user exists
        userInfoRepository.findById(userInfoId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userInfoId));

        return buildStudentTestDto(test);
    }

    @Override
    public TestResultDto submitTestAnswers(UUID testId, TestSubmissionDto submission) {
        log.info("Submitting test answers for testId: {} and userInfoId: {}", testId, submission.getUserInfoId());

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + testId));

        UserInfo userInfo = userInfoRepository.findById(submission.getUserInfoId())
                .orElseThrow(() -> new NotFoundException("User not found with id: " + submission.getUserInfoId()));

        // Grade the test
        TestResultDto result = gradeTest(test, submission);

        // Save submission to database
        saveSubmission(test, userInfo, submission, result);

        // Update course progress if test is passed
        if (result.getPassed()) {
            updateCourseProgress(test, userInfo);
        }

        return result;
    }

    @Override
    public TestResultDto getTestResult(UUID testId, UUID userInfoId) {
        log.info("Getting test result for testId: {} and userInfoId: {}", testId, userInfoId);

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + testId));

        UserInfo userInfo = userInfoRepository.findById(userInfoId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userInfoId));

        UserTestSubmission submission = userTestSubmissionRepository
                .findFirstByTestAndUserInfoOrderByCreatedAtDesc(test, userInfo)
                .orElseThrow(() -> new NotFoundException("No submission found for this test"));

        return buildTestResultDto(submission, test);
    }

    @Override
    public StudentTestDto getEntranceTest(UUID courseId, UUID userInfoId) {
        log.info("Getting entrance test for courseId: {} and userInfoId: {}", courseId, userInfoId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + courseId));

        Test test = testRepository.findByCourseAndType(course, "ENTRANCE_TEST_COURSE")
                .orElseThrow(() -> new NotFoundException("Entrance test not found for course: " + courseId));

        return getTestQuestions(test.getId(), userInfoId);
    }

    @Override
    public StudentTestDto getLectureReviewTest(UUID lectureId, UUID userInfoId) {
        log.info("Getting lecture review test for lectureId: {} and userInfoId: {}", lectureId, userInfoId);

        CourseSection courseSection = courseSectionRepository.findById(lectureId)
                .orElseThrow(() -> new NotFoundException("Lecture not found with id: " + lectureId));

        Test test = testRepository.findByCourseSectionAndType(courseSection, "LECTURE_REVIEW_QUESTIONS_COURSE")
                .orElseGet(() -> {
                    // Fallback for older records linked only from CourseSection.test
                    Test t = courseSection.getTest();
                    if (t != null && "LECTURE_REVIEW_QUESTIONS_COURSE".equalsIgnoreCase(t.getType())) {
                        return t;
                    }
                    throw new NotFoundException("Lecture review test not found for lecture: " + lectureId);
                });

        return getTestQuestions(test.getId(), userInfoId);
    }

    @Override
    public StudentTestDto getFinalExam(UUID courseId, UUID userInfoId) {
        log.info("Getting final exam for courseId: {} and userInfoId: {}", courseId, userInfoId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + courseId));

        Test test = testRepository.findByCourseAndType(course, "FINAL_EXAM_COURSE")
                .orElseThrow(() -> new NotFoundException("Final exam not found for course: " + courseId));

        return getTestQuestions(test.getId(), userInfoId);
    }

    // Helper methods

    private StudentTestDto buildStudentTestDto(Test test) {
        StudentTestDto dto = new StudentTestDto();
        dto.setId(test.getId());
        dto.setTitle(test.getTitle());
        dto.setDescription(test.getDescription());
        dto.setCourseId(test.getCourse() != null ? test.getCourse().getId() : null);
        dto.setType(test.getType());
        dto.setPassingScore(DEFAULT_PASSING_SCORE);

        List<StudentQuestionDto> questionDtos = test.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getOrderIndex, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::buildStudentQuestionDto)
                .collect(Collectors.toList());

        dto.setQuestions(questionDtos);
        return dto;
    }

    private StudentQuestionDto buildStudentQuestionDto(Question question) {
        StudentQuestionDto dto = new StudentQuestionDto();
        dto.setId(question.getId());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setType(QuestionType.fromValue(question.getType()));
        dto.setOrderIndex(question.getOrderIndex());

        // Parse answers and hide correct answer flag
        List<StudentAnswerDto> answerDtos = parseAndHideAnswers(question.getAnswers());
        dto.setAnswers(answerDtos);

        // Add attachments with pre-signed URLs
        if (question.getAttachments() != null && !question.getAttachments().isEmpty()) {
            List<QuestionAttachmentResponseDto> attachmentDtos = question.getAttachments().stream()
                    .map(this::buildAttachmentDto)
                    .collect(Collectors.toList());
            dto.setAttachments(attachmentDtos);
        }

        return dto;
    }

    private List<StudentAnswerDto> parseAndHideAnswers(String answersJson) {
        if (answersJson == null || answersJson.isEmpty()) {
            log.warn("Answers JSON is null or empty");
            return new ArrayList<>();
        }

        try {
            log.debug("Parsing answers JSON: {}", answersJson);

            // Try to parse as generic object first to detect format
            Object answersObject = objectMapper.readValue(answersJson, Object.class);

            // Format 1: [{id, content, isCorrect}] - Admin UI format
            if (answersObject instanceof List) {
                List<Map<String, Object>> answers = objectMapper.readValue(answersJson,
                        new TypeReference<List<Map<String, Object>>>() {
                        });
                log.debug("Parsed {} answers in array format", answers.size());
                return answers.stream().map(answer -> {
                    StudentAnswerDto dto = new StudentAnswerDto();
                    dto.setId(UUID.fromString((String) answer.get("id")));

                    // Remove isCorrect from content
                    Map<String, Object> content = new HashMap<>(answer);
                    content.remove("isCorrect");
                    dto.setContent(content);

                    return dto;
                }).collect(Collectors.toList());
            }

            // Format 2: {options: [{id, text}], correctAnswers: []} - Direct API format
            if (answersObject instanceof Map) {
                Map<String, Object> answersMap = (Map<String, Object>) answersObject;
                if (answersMap.containsKey("options")) {
                    List<Map<String, Object>> options = (List<Map<String, Object>>) answersMap.get("options");
                    log.debug("Parsed {} answers in options format", options.size());
                    return options.stream().map(option -> {
                        StudentAnswerDto dto = new StudentAnswerDto();
                        // For options format, id might be a String like "a", "b", not UUID
                        Object idObj = option.get("id");
                        if (idObj instanceof String) {
                            String idStr = (String) idObj;
                            try {
                                dto.setId(UUID.fromString(idStr));
                            } catch (IllegalArgumentException e) {
                                // If not UUID, generate a deterministic UUID from the string
                                dto.setId(UUID.nameUUIDFromBytes(idStr.getBytes()));
                            }
                        }
                        // Don't include correctAnswers in the content
                        dto.setContent(option);
                        return dto;
                    }).collect(Collectors.toList());
                }
            }

            log.warn("Unknown answers format: {}", answersJson);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to parse answers JSON: {}", answersJson, e);
            return new ArrayList<>();
        }
    }

    private QuestionAttachmentResponseDto buildAttachmentDto(QuestionAttachment attachment) {
        QuestionAttachmentResponseDto dto = new QuestionAttachmentResponseDto();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setWidth(attachment.getWidth());
        dto.setHeight(attachment.getHeight());

        // Generate pre-signed URL from objectKey and bucket
        if (attachment.getObjectKey() != null && attachment.getBucket() != null) {
            String preSignedUrl = minioService.createGetPreSignedLink(
                    attachment.getObjectKey().toString(),
                    attachment.getBucket());
            dto.setFileUrl(preSignedUrl);
        }

        return dto;
    }

    private TestResultDto gradeTest(Test test, TestSubmissionDto submission) {
        TestResultDto result = new TestResultDto();
        result.setTestId(test.getId());
        result.setUserId(submission.getUserInfoId());
        result.setSubmittedAt(OffsetDateTime.now(ZoneOffset.UTC));

        List<QuestionResultDto> questionResults = new ArrayList<>();
        int correctCount = 0;
        int totalQuestions = test.getQuestions().size();

        // Parse stored answers
        Map<UUID, List<UUID>> correctAnswersMap = new HashMap<>();
        for (Question question : test.getQuestions()) {
            List<UUID> correctAnswerIds = parseCorrectAnswers(question.getAnswers());
            correctAnswersMap.put(question.getId(), correctAnswerIds);
        }

        // Grade each question
        for (SubmittedAnswerDto submittedAnswer : submission.getAnswers()) {
            UUID questionId = submittedAnswer.getQuestionId();
            List<UUID> selectedAnswers = submittedAnswer.getSelectedAnswers();
            List<UUID> correctAnswers = correctAnswersMap.get(questionId);

            boolean isCorrect = checkAnswerCorrectness(selectedAnswers, correctAnswers);
            if (isCorrect) {
                correctCount++;
            }

            // Build question result
            Question question = test.getQuestions().stream()
                    .filter(q -> q.getId().equals(questionId))
                    .findFirst()
                    .orElse(null);

            if (question != null) {
                QuestionResultDto questionResult = new QuestionResultDto();
                questionResult.setQuestionId(questionId);
                questionResult.setCorrect(isCorrect);
                questionResult.setSelectedAnswers(selectedAnswers);
                questionResult.setCorrectAnswers(correctAnswers);
                questionResult.setQuestion(buildStudentQuestionDto(question));
                questionResults.add(questionResult);
            }
        }

        result.setCorrectCount(correctCount);
        result.setTotalQuestions(totalQuestions);
        int score = totalQuestions > 0 ? (correctCount * 100 / totalQuestions) : 0;
        result.setScore(score);
        result.setPassed(score >= DEFAULT_PASSING_SCORE);
        result.setQuestions(questionResults);

        return result;
    }

    private List<UUID> parseCorrectAnswers(String answersJson) {
        if (answersJson == null || answersJson.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            // Try to parse as generic object first to detect format
            Object answersObject = objectMapper.readValue(answersJson, Object.class);

            // Format 1: [{id, content, isCorrect}] - Admin UI format
            if (answersObject instanceof List) {
                List<Map<String, Object>> answers = objectMapper.readValue(answersJson,
                        new TypeReference<List<Map<String, Object>>>() {
                        });
                return answers.stream()
                        .filter(answer -> Boolean.TRUE.equals(answer.get("isCorrect")))
                        .map(answer -> UUID.fromString((String) answer.get("id")))
                        .collect(Collectors.toList());
            }

            // Format 2: {options: [{id, text}], correctAnswers: []} - Direct API format
            if (answersObject instanceof Map) {
                Map<String, Object> answersMap = (Map<String, Object>) answersObject;
                if (answersMap.containsKey("correctAnswers")) {
                    List<String> correctAnswerIds = (List<String>) answersMap.get("correctAnswers");
                    return correctAnswerIds.stream().map(idStr -> {
                        try {
                            return UUID.fromString(idStr);
                        } catch (IllegalArgumentException e) {
                            // If not UUID, generate a deterministic UUID from the string
                            return UUID.nameUUIDFromBytes(idStr.getBytes());
                        }
                    }).collect(Collectors.toList());
                }
            }

            log.warn("Unknown answers format for grading: {}", answersJson);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to parse answers JSON for grading", e);
            return new ArrayList<>();
        }
    }

    private boolean checkAnswerCorrectness(List<UUID> selectedAnswers, List<UUID> correctAnswers) {
        if (selectedAnswers == null || selectedAnswers.isEmpty()) {
            return correctAnswers == null || correctAnswers.isEmpty();
        }
        if (correctAnswers == null || correctAnswers.isEmpty()) {
            return false;
        }

        Set<UUID> selectedSet = new HashSet<>(selectedAnswers);
        Set<UUID> correctSet = new HashSet<>(correctAnswers);

        return selectedSet.equals(correctSet);
    }

    private void saveSubmission(Test test, UserInfo userInfo, TestSubmissionDto submission, TestResultDto result) {
        try {
            // Count previous attempts
            long attemptCount = userTestSubmissionRepository.countByTestAndUserInfo(test, userInfo);

            UserTestSubmission submissionEntity = UserTestSubmission.builder()
                    .test(test)
                    .userInfo(userInfo)
                    .submittedAnswers(objectMapper.writeValueAsString(submission.getAnswers()))
                    .score(result.getScore())
                    .correctCount(result.getCorrectCount())
                    .totalQuestions(result.getTotalQuestions())
                    .passed(result.getPassed())
                    .attemptNumber((int) attemptCount + 1)
                    .gradingDetails(objectMapper.writeValueAsString(result.getQuestions()))
                    .build();

            userTestSubmissionRepository.save(submissionEntity);
            log.info("Saved test submission for user {} on test {}", userInfo.getId(), test.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize submission data", e);
            throw new BadRequestException("Failed to save submission");
        }
    }

    private TestResultDto buildTestResultDto(UserTestSubmission submission, Test test) {
        try {
            TestResultDto result = new TestResultDto();
            result.setTestId(submission.getTest().getId());
            result.setUserId(submission.getUserInfo().getId());
            result.setScore(submission.getScore());
            result.setCorrectCount(submission.getCorrectCount());
            result.setTotalQuestions(submission.getTotalQuestions());
            result.setPassed(submission.getPassed());
            result.setSubmittedAt(OffsetDateTime.of(submission.getCreatedAt(), ZoneOffset.UTC));

            // Parse grading details
            if (submission.getGradingDetails() != null) {
                List<QuestionResultDto> questionResults = objectMapper.readValue(
                        submission.getGradingDetails(),
                        new TypeReference<List<QuestionResultDto>>() {
                        });
                result.setQuestions(questionResults);
            }

            return result;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse grading details", e);
            throw new BadRequestException("Failed to build test result");
        }
    }

    private void updateCourseProgress(Test test, UserInfo userInfo) {
        Course course = test.getCourse();
        if (course == null) {
            return;
        }

        UserRegistrationCourse registration = userRegistrationCourseRepository
                .findByCourseAndUser(course, userInfo)
                .orElseThrow(() -> new NotFoundException("User not enrolled in course"));

        String testType = test.getType();

        switch (testType) {
            case "ENTRANCE_TEST_COURSE":
                registration.setIsCompletedEntranceTest(true);
                log.info("Updated entrance test completion for user {} in course {}", userInfo.getId(), course.getId());
                break;

            case "LECTURE_REVIEW_QUESTIONS_COURSE":
                // Mark lecture review completion and, if video is done, mark section completed
                if (test.getCourseSection() != null) {
                    UUID courseSectionId = test.getCourseSection().getId();
                    userProgressCourseSectionRepository
                            .findByUserRegistrationCourseIdAndCourseSectionId(registration.getId(), courseSectionId)
                            .ifPresent(upcs -> {
                                upcs.setIsCompletedLectureReviewQuestion(true);
                                boolean videoDone = Boolean.TRUE.equals(upcs.getIsCompletedVideoCourseSection());
                                if (videoDone) {
                                    upcs.setIsCompletedCourseSection(true);
                                }
                                userProgressCourseSectionRepository.save(upcs);
                            });
                } else {
                    // Fallback for legacy tests not linked via test.courseSection
                    registration.getUserProgressCourseSections().stream()
                            .filter(upcs -> upcs.getCourseSection() != null
                                    && upcs.getCourseSection().getTest() != null
                                    && test.getId().equals(upcs.getCourseSection().getTest().getId()))
                            .findFirst()
                            .ifPresent(upcs -> {
                                upcs.setIsCompletedLectureReviewQuestion(true);
                                boolean videoDone = Boolean.TRUE.equals(upcs.getIsCompletedVideoCourseSection());
                                if (videoDone) {
                                    upcs.setIsCompletedCourseSection(true);
                                }
                                userProgressCourseSectionRepository.save(upcs);
                            });
                }

                // Recompute aggregates after this section update
                if (registration.getUserProgressCourseSections() != null) {
                    int total = registration.getUserProgressCourseSections().size();
                    int completed = (int) registration.getUserProgressCourseSections().stream()
                            .filter(s -> Boolean.TRUE.equals(s.getIsCompletedCourseSection()))
                            .count();
                    registration.setTotalLectures(total);
                    registration.setNumberLecturesCompleted(completed);
                    registration.setIsCompletedTotalCourseSection(total > 0 && completed == total);
                }
                log.info("Lecture review test passed for user {} in course {}", userInfo.getId(), course.getId());
                break;

            case "FINAL_EXAM_COURSE":
                registration.setIsCompletedFinalCourseTest(true);
                registration.setIsCompletedCourse(true);
                log.info("Updated final exam completion for user {} in course {}", userInfo.getId(), course.getId());
                break;

            default:
                log.warn("Unknown test type: {}", testType);
        }

        userRegistrationCourseRepository.save(registration);
    }
}
