package com.endo4life.service.test;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.CourseSection;
import com.endo4life.domain.document.Question;
import com.endo4life.domain.document.QuestionAttachment;
import com.endo4life.domain.document.Test;
import com.endo4life.mapper.QuestionMapper;
import com.endo4life.mapper.TestMapper;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.CourseSectionRepository;
import com.endo4life.repository.TestRepository;
import com.endo4life.security.UserContextHolder;
import com.endo4life.web.rest.model.CreateQuestionRequestDto;
import com.endo4life.web.rest.model.CreateTestRequestDto;
import com.endo4life.web.rest.model.QuestionAttachmentCreateDto;
import com.endo4life.web.rest.model.TestDetailResponseDto;
import com.endo4life.web.rest.model.TestResponseDto;
import com.endo4life.web.rest.model.UpdateQuestionRequestDto;
import com.endo4life.web.rest.model.UpdateTestRequestDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final CourseRepository courseRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final TestMapper testMapper;
    private final QuestionMapper questionMapper;
    private final ObjectMapper objectMapper;

    @Override
    public List<TestResponseDto> getTestsByCourseId(UUID courseId) {
        return testRepository.findByCourseId(courseId).stream()
                .map(testMapper::toTestResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public TestDetailResponseDto getTestByCourseIdAndType(UUID courseId, String type) {
        List<Test> tests = testRepository.findByCourseIdAndType(courseId, type);
        if (CollectionUtils.isEmpty(tests)) {
            throw new NotFoundException("Test not found for courseId: " + courseId + " and type: " + type);
        }
        Test test = tests.get(0);
        TestDetailResponseDto responseDto = testMapper.toTestDetailResponseDto(test);
        responseDto.setCourseId(courseId);
        return responseDto;
    }

    @Override
    public UUID createTest(CreateTestRequestDto createTestRequestDto) {
        UUID courseId = createTestRequestDto.getCourseId();
        String testType = createTestRequestDto.getType();
        String emailUserLogin = UserContextHolder.getEmail().orElse(Constants.SYSTEM);

        // Validate: prevent duplicate tests (except LECTURE_REVIEW_QUESTIONS)
        if (!StringUtils.equalsIgnoreCase(Constants.LECTURE_REVIEW_QUESTIONS_COURSE, testType)) {
            List<Test> existingTests = testRepository.findByCourseIdAndType(courseId, testType);
            if (CollectionUtils.isNotEmpty(existingTests)) {
                throw new BadRequestException("A test of type " + testType + " already exists for this course");
            }
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + courseId));

        Test test = testMapper.toTest(createTestRequestDto);
        test.setCourse(course);
        test.setCreatedBy(emailUserLogin);
        test.setUpdatedBy(emailUserLogin);

        // Handle questions if provided
        if (createTestRequestDto.getQuestions() != null && !createTestRequestDto.getQuestions().isEmpty()) {
            List<Question> questions = processCreateQuestionEntities(test, createTestRequestDto.getQuestions(),
                    emailUserLogin);
            test.setQuestions(questions);
        }

        testRepository.save(test);

        // Link to course section if it's a lecture review test
        if (StringUtils.equalsIgnoreCase(Constants.LECTURE_REVIEW_QUESTIONS_COURSE, testType)) {
            updateCourseSectionEntity(test, createTestRequestDto);
        }

        return test.getId();
    }

    private List<Question> processCreateQuestionEntities(Test test, List<CreateQuestionRequestDto> questionDtos,
            String emailUserLogin) {
        List<Question> questions = new ArrayList<>();
        int orderIndex = 0;

        for (CreateQuestionRequestDto questionDto : questionDtos) {
            Question question = questionMapper.toQuestion(questionDto);
            question.setTest(test);
            question.setOrderIndex(orderIndex++);
            question.setCreatedBy(emailUserLogin);
            question.setUpdatedBy(emailUserLogin);

            // Convert answers to JSON string and ensure IDs
            try {
                if (questionDto.getAnswers() != null) {
                    Object answersWithIds = ensureAnswerIds(questionDto.getAnswers());
                    // Extract metadata array if it's wrapped in an object
                    Object answersToStore = unwrapMetadata(answersWithIds);
                    String answersJson = objectMapper.writeValueAsString(answersToStore);
                    question.setAnswers(answersJson);
                }
            } catch (JsonProcessingException e) {
                log.error("Error converting answers to JSON string", e);
            }

            // Handle attachments
            if (questionDto.getAttachments() != null && !questionDto.getAttachments().isEmpty()) {
                List<QuestionAttachment> attachments = processCreateQuestionAttachmentEntities(question,
                        questionDto.getAttachments(), emailUserLogin);
                question.setAttachments(attachments);
            }

            questions.add(question);
        }

        return questions;
    }

    private List<QuestionAttachment> processCreateQuestionAttachmentEntities(Question question,
            List<QuestionAttachmentCreateDto> attachmentDtos, String emailUserLogin) {
        List<QuestionAttachment> attachments = new ArrayList<>();

        for (QuestionAttachmentCreateDto attachmentDto : attachmentDtos) {
            if (attachmentDto == null)
                continue;

            QuestionAttachment attachment = QuestionAttachment.builder()
                    .question(question)
                    .objectKey(attachmentDto.getObjectKey())
                    .bucket(attachmentDto.getBucket())
                    .fileName(attachmentDto.getFileName())
                    .fileType(attachmentDto.getFileType())
                    .fileSize(attachmentDto.getFileSize())
                    .width(attachmentDto.getWidth())
                    .height(attachmentDto.getHeight())
                    .build();
            attachment.setCreatedBy(emailUserLogin);
            attachment.setUpdatedBy(emailUserLogin);
            attachments.add(attachment);
        }

        return attachments;
    }

    private Object ensureAnswerIds(Object answersObject) {
        // Ensure all answer metadata has UUIDs
        // This assumes answers structure has a "metadata" list with answer objects
        try {
            if (answersObject instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> answersMap = (java.util.Map<String, Object>) answersObject;
                if (answersMap.containsKey("metadata") && answersMap.get("metadata") instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<java.util.Map<String, Object>> metadata = (List<java.util.Map<String, Object>>) answersMap
                            .get("metadata");
                    for (java.util.Map<String, Object> answer : metadata) {
                        if (!answer.containsKey("id") || answer.get("id") == null) {
                            answer.put("id", UUID.randomUUID().toString());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not ensure answer IDs", e);
        }
        return answersObject;
    }

    private Object unwrapMetadata(Object answersObject) {
        // If answers are wrapped in {"metadata": [...]}, extract just the array
        try {
            if (answersObject instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> answersMap = (java.util.Map<String, Object>) answersObject;
                if (answersMap.containsKey("metadata")) {
                    return answersMap.get("metadata");
                }
            }
        } catch (Exception e) {
            log.warn("Could not unwrap metadata", e);
        }
        return answersObject;
    }

    private void updateCourseSectionEntity(Test test, CreateTestRequestDto createTestRequestDto) {
        UUID courseSectionId = createTestRequestDto.getCourseSectionId();
        if (courseSectionId == null) {
            throw new BadRequestException("courseSectionId is required for LECTURE_REVIEW_QUESTIONS_COURSE");
        }

        CourseSection courseSection = courseSectionRepository.findById(courseSectionId)
                .orElseThrow(() -> new NotFoundException("Course section not found with id: " + courseSectionId));

        if (courseSection.getTest() != null) {
            throw new BadRequestException("This course section already has a review test");
        }

        // Link both sides: owning sides are course_section_id on Test and test_id on
        // CourseSection
        test.setCourseSection(courseSection);
        courseSection.setTest(test);
        testRepository.save(test);
        courseSectionRepository.save(courseSection);
    }

    @Override
    public TestDetailResponseDto getTestById(UUID id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + id));
        return testMapper.toTestDetailResponseDto(test);
    }

    @Override
    public void updateTest(UUID id, UpdateTestRequestDto updateTestRequestDto) {
        String emailUserLogin = UserContextHolder.getEmail().orElse(Constants.SYSTEM);

        Test test = testRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Test not found with id: " + id));

        // Update basic test info
        testMapper.updateTestFromDto(test, updateTestRequestDto);
        test.setUpdatedBy(emailUserLogin);
        test.setUpdatedAt(LocalDateTime.now());

        // Handle questions with smart update logic
        if (updateTestRequestDto.getQuestions() != null) {
            processUpdateQuestions(test, updateTestRequestDto.getQuestions(), emailUserLogin);
        }

        testRepository.save(test);
    }

    private void processUpdateQuestions(Test test, List<UpdateQuestionRequestDto> questionDtos, String emailUserLogin) {
        log.debug("Processing {} total questions for update", questionDtos.size());

        // Get existing question IDs from database
        List<String> existingQuestionIds = test.getQuestions().stream()
                .map(Question::getId)
                .filter(Objects::nonNull)
                .map(UUID::toString)
                .toList();
        log.debug("Existing question IDs in database: {}", existingQuestionIds);

        // Separate questions into: existing (to update), new (to create), and deleted
        // EXISTING: Has an ID AND that ID exists in database
        List<UpdateQuestionRequestDto> existingQuestions = new ArrayList<>();
        List<UpdateQuestionRequestDto> newQuestions = new ArrayList<>();
        List<UpdateQuestionRequestDto> questionsToDelete = new ArrayList<>();

        for (UpdateQuestionRequestDto dto : questionDtos) {
            if (Boolean.TRUE.equals(dto.getIsDelete())) {
                questionsToDelete.add(dto);
            } else {
                // Check if this question has a database ID
                String questionIdStr = dto.getId() != null ? dto.getId().toString() : null;
                if (questionIdStr != null && existingQuestionIds.contains(questionIdStr)) {
                    existingQuestions.add(dto);
                } else {
                    newQuestions.add(dto);
                }
            }
        }

        log.debug("Found {} existing questions (with DB ID)", existingQuestions.size());
        log.debug("Found {} new questions (no DB ID or ID not in DB)", newQuestions.size());
        log.debug("Found {} questions to delete", questionsToDelete.size());

        // 1. Update existing questions
        if (CollectionUtils.isNotEmpty(existingQuestions)) {
            updateExistingQuestions(test, existingQuestions, emailUserLogin);
        }

        // 2. Create new questions
        if (CollectionUtils.isNotEmpty(newQuestions)) {
            List<Question> newQuestionEntities = createNewQuestions(test, newQuestions, emailUserLogin);
            test.getQuestions().addAll(newQuestionEntities);
        }

        // 3. Delete marked questions
        if (CollectionUtils.isNotEmpty(questionsToDelete)) {
            deleteMarkedQuestions(test, questionsToDelete);
        }
    }

    private void updateExistingQuestions(Test test, List<UpdateQuestionRequestDto> questionDtos,
            String emailUserLogin) {
        List<Question> existingQuestions = test.getQuestions();

        // Match questions by ID
        for (UpdateQuestionRequestDto questionDto : questionDtos) {
            if (questionDto.getId() == null) {
                log.warn("Skipping question update - no ID provided");
                continue;
            }

            // Find the matching question entity
            Question questionEntity = existingQuestions.stream()
                    .filter(q -> q.getId().equals(questionDto.getId()))
                    .findFirst()
                    .orElse(null);

            if (questionEntity == null) {
                log.warn("Question with ID {} not found in test", questionDto.getId());
                continue;
            }

            if (Objects.nonNull(questionDto.getTitle())) {
                questionEntity.setTitle(questionDto.getTitle());
            }

            if (Objects.nonNull(questionDto.getType())) {
                questionEntity.setType(questionDto.getType().toString());
            }

            if (Objects.nonNull(questionDto.getDescription())) {
                questionEntity.setDescription(questionDto.getDescription());
            }

            questionEntity.setUpdatedBy(emailUserLogin);
            questionEntity.setUpdatedAt(LocalDateTime.now());

            // Update answers with ID generation
            if (Objects.nonNull(questionDto.getAnswers())) {
                try {
                    Object answersWithIds = ensureAnswerIds(questionDto.getAnswers());
                    // Extract metadata array if it's wrapped in an object
                    Object answersToStore = unwrapMetadata(answersWithIds);
                    String answersJson = objectMapper.writeValueAsString(answersToStore);
                    questionEntity.setAnswers(answersJson);
                    log.debug("Updated question {} with {} answers", questionEntity.getId(), answersJson);
                } catch (JsonProcessingException e) {
                    log.error("Error converting answers to JSON string", e);
                }
            }

            // Smart attachment update
            if (Objects.nonNull(questionDto.getAttachments())) {
                processUpdateQuestionAttachments(questionEntity, questionDto.getAttachments(), emailUserLogin);
            }
        }
    }

    private void processUpdateQuestionAttachments(Question questionEntity,
            List<QuestionAttachmentCreateDto> attachmentDtos, String emailUserLogin) {
        if (attachmentDtos == null)
            return;

        List<UUID> existingObjectKeys = questionEntity.getAttachments()
                .stream()
                .map(QuestionAttachment::getObjectKey)
                .filter(Objects::nonNull)
                .toList();

        List<QuestionAttachmentCreateDto> newAttachments = new ArrayList<>();

        // Process each attachment
        for (QuestionAttachmentCreateDto attachmentDto : attachmentDtos) {
            UUID objectKey = attachmentDto.getObjectKey();

            // If it's a new attachment (not in existing), add it
            if (!existingObjectKeys.contains(objectKey)) {
                newAttachments.add(attachmentDto);
            }
        }

        // Add new attachments
        for (QuestionAttachmentCreateDto attachmentDto : newAttachments) {
            QuestionAttachment attachment = QuestionAttachment.builder()
                    .question(questionEntity)
                    .objectKey(attachmentDto.getObjectKey())
                    .bucket(attachmentDto.getBucket())
                    .fileName(attachmentDto.getFileName())
                    .fileType(attachmentDto.getFileType())
                    .fileSize(attachmentDto.getFileSize())
                    .width(attachmentDto.getWidth())
                    .height(attachmentDto.getHeight())
                    .build();
            attachment.setCreatedBy(emailUserLogin);
            attachment.setUpdatedBy(emailUserLogin);
            questionEntity.getAttachments().add(attachment);
        }
    }

    private List<Question> createNewQuestions(Test test, List<UpdateQuestionRequestDto> questionDtos,
            String emailUserLogin) {
        log.debug("Creating {} new questions", questionDtos.size());
        List<Question> newQuestions = new ArrayList<>();

        for (UpdateQuestionRequestDto questionDto : questionDtos) {
            log.debug("Creating new question with description: {}", questionDto.getDescription());
            Question newQuestion = questionMapper.toQuestionFromUpdate(questionDto);
            newQuestion.setTest(test);
            newQuestion.setId(UUID.randomUUID());
            newQuestion.setCreatedBy(emailUserLogin);
            newQuestion.setUpdatedBy(emailUserLogin);
            newQuestion.setCreatedAt(LocalDateTime.now());
            newQuestion.setUpdatedAt(LocalDateTime.now());

            // Handle answers
            if (Objects.nonNull(questionDto.getAnswers())) {
                try {
                    Object answersWithIds = ensureAnswerIds(questionDto.getAnswers());
                    // Extract metadata array if it's wrapped in an object
                    Object answersToStore = unwrapMetadata(answersWithIds);
                    String answersJson = objectMapper.writeValueAsString(answersToStore);
                    newQuestion.setAnswers(answersJson);
                } catch (JsonProcessingException e) {
                    log.error("Error converting answers to JSON string", e);
                }
            }

            // Handle attachments
            if (Objects.nonNull(questionDto.getAttachments()) && !questionDto.getAttachments().isEmpty()) {
                List<QuestionAttachment> attachments = processCreateQuestionAttachmentEntities(newQuestion,
                        questionDto.getAttachments(), emailUserLogin);
                newQuestion.setAttachments(attachments);
            }

            newQuestions.add(newQuestion);
        }

        return newQuestions;
    }

    private void deleteMarkedQuestions(Test test, List<UpdateQuestionRequestDto> questionsToDelete) {
        List<Question> questionsToRemove = new ArrayList<>();

        // Find questions to delete by matching criteria
        for (Question questionEntity : test.getQuestions()) {
            for (UpdateQuestionRequestDto questionDto : questionsToDelete) {
                // Match by content or other identifier
                if (Objects.equals(questionEntity.getTitle(), questionDto.getTitle())) {
                    questionsToRemove.add(questionEntity);
                    break;
                }
            }
        }

        if (CollectionUtils.isNotEmpty(questionsToRemove)) {
            test.getQuestions().removeAll(questionsToRemove);
        }
    }

    @Override
    public void deleteTest(UUID id) {
        if (!testRepository.existsById(id)) {
            throw new NotFoundException("Test not found with id: " + id);
        }
        testRepository.deleteById(id);
    }
}